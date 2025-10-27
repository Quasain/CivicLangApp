import { NextRequest, NextResponse } from "next/server";
import { aiOrHeuristics } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();
    const output = await aiOrHeuristics(
      `Rewrite the following in plain language for a resident. Output language: ${lang}. Text: ${text}`,
      async () => `[DEMO] Simplified (${lang}): Keep your trash bins out of street view except on collection day.`
    );
    return NextResponse.json({ output });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
