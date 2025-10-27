import { NextRequest, NextResponse } from "next/server";
import { aiOrHeuristics } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const { text, target } = await req.json();
    const output = await aiOrHeuristics(
      `Translate and simplify into ${target}. Keep meaning accurate and civic-friendly. Text: ${text}`,
      async () => `[DEMO] (${target}) ${text} — (simplified translation not available offline)`
    );
    return NextResponse.json({ output });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
