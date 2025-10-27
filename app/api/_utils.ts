import OpenAI from "openai";
import { contextFor } from "@/lib/rag";

export function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function aiOrHeuristics(prompt: string, heuristics: () => Promise<string> | string) {
  const client = getClient();
  if (!client) return await heuristics();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are CivicLang, a local civic assistant for Irvine. Be concise and helpful." },
               { role: "user", content: prompt }],
    temperature: 0.2
  });
  return res.choices[0]?.message?.content ?? "";
}

export function ragWrap(query: string) {
  const ctx = contextFor(query);
  return `Use the context below about Irvine to answer. If insufficient, answer generally and say what you are assuming.\nContext:\n${ctx}\n\nUser: ${query}`;
}
