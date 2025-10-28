// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getRagContext } from "@/lib/rag";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

const client =
  process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const ISO_TO_NAME: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ko: "Korean",
  fa: "Persian",
  vi: "Vietnamese",
};

function systemPrompt(targetLanguageName: string) {
  return [
    `You are Civic Chat, a helpful assistant for Irvine residents.`,
    `ALWAYS reply in ${targetLanguageName}.`,
    `Start with clear, numbered, step-by-step instructions (1., 2., 3., …).`,
    `After the steps, include brief bullet points with key links, phone numbers, or office hours if relevant.`,
    `If you used local context snippets, add: "Sources: [#1 label], [#2 label]".`,
    `If missing details, state what you need and ask up to 2 clarifying questions.`,
  ].join("\n");
}

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[]; // new UI shape
      language?: string;        // "auto" | ISO code
      // legacy (single-shot) fields supported for backward compatibility
      question?: string;
      lang?: string;
    };

    // Normalize inputs to a conversation history + language
    let history = body.messages ?? [];
    let requestedLang = body.language ?? "auto";

    if ((!history || history.length === 0) && body.question) {
      history = [{ role: "user", content: body.question }];
      if (body.lang) requestedLang = body.lang;
    }

    // Last user message for retrieval + guard
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
    if (!lastUser) {
      return NextResponse.json(
        { reply: "Please provide a question to begin.", detectedLanguage: "en" },
        { status: 400 }
      );
    }

    // Tiny file-based RAG context (safe no-op if no /data)
    const rag = await getRagContext(lastUser);

    const target =
      requestedLang === "auto"
        ? "the user's language"
        : ISO_TO_NAME[requestedLang] ?? "the user's language";

    const sys = { role: "system" as const, content: systemPrompt(target) };

    // Sandwich the latest user message with local context
    const userWithRag = [
      `USER QUESTION:\n${lastUser}`,
      rag ? `\n\nLOCAL CONTEXT (use if relevant; otherwise ignore):\n${rag}\n\n— end of context —` : "",
    ].join("");

    // Keep conversation memory, but ensure our server-side system prompt is first
    const modelMessages: ChatMessage[] = [
      sys,
      ...(history ?? []).filter((m) => m.role !== "system"),
      { role: "user", content: userWithRag },
    ];

    // Demo fallback if no key is set — keeps UI functional
    if (!client) {
      const demo = [
        "1. Open the city services portal.",
        "2. Select the category and enter your address.",
        "3. Describe the issue and submit the form.",
        "",
        "• Phone: 949-724-6000",
        "• Sources: Irvine Public Works",
      ].join("\n");
      return NextResponse.json({
        reply: demo,
        detectedLanguage: requestedLang === "auto" ? "en" : requestedLang,
      });
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: modelMessages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn’t generate a reply. Please try again.";

    // Simple detection echo (you can improve with a detection pass if you like)
    const detectedLanguage = requestedLang === "auto" ? "en" : requestedLang;

    return NextResponse.json({ reply, detectedLanguage });
  } catch (err: any) {
    return new NextResponse(`Chat API error: ${err?.message || "unknown error"}`, {
      status: 500,
    });
  }
}
