import { NextRequest, NextResponse } from "next/server";
import { aiOrHeuristics } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const { text, lang, tone } = await req.json();
    const output = await aiOrHeuristics(
      `Rewrite this message to city staff in a ${tone} tone in ${lang}. Keep it concise and respectful: ${text}`,
      async () => `[DEMO ${tone}] Hello, my trash was not collected today. Could you advise on the next steps?`
    );
    return NextResponse.json({ output });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
