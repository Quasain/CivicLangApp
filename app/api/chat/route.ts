import { NextRequest, NextResponse } from "next/server";
import { aiOrHeuristics } from "../_utils";
import { contextFor } from "@/lib/rag"; // ✅ use civic data from /data
export const runtime = "nodejs"; // ✅ required for fs access in rag.ts

export async function POST(req) {
  try {
    const { question, lang } = await req.json();

    // 1️⃣ Retrieve relevant local context
    const civicContext = contextFor(question);

    // 2️⃣ Wrap question + context into a richer prompt
    const prompt = `
Answer in ${lang}. Use local civic data where possible.
If helpful, cite relevant URLs or sources.

Context:
${civicContext}

Question:
${question}
    `.trim();

    // 3️⃣ Call AI (or fallback heuristic)
    const output = await aiOrHeuristics(prompt, async () => {
      return `[DEMO] Based on local info: For a missed trash pickup, contact the City's waste services or submit an online request with your address and collection day.`;
    });

    return NextResponse.json({ output });
  } catch (e) {
    return NextResponse.json(
      { error: e.message || "Failed" },
      { status: 500 }
    );
  }
}
