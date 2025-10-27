// app/api/form-explainer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aiOrHeuristics } from "../_utils";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60; // allow enough time for larger PDFs

function stripRtf(raw: string) {
  // very simple RTF → text cleanup good enough for civic forms
  return raw
    .replace(/\\'[0-9a-fA-F]{2}/g, " ")  // hex escapes
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\[a-z]+-?\d* ?/g, "")     // control words
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function explain(text: string, lang = "English") {
  const clipped = (text || "").slice(0, 8000); // keep prompt compact
  const prompt = `
Explain the following civic form content step-by-step in ${lang}.
- Use clear, plain-language bullet points.
- List what the resident needs (documents, IDs, deadlines).
- Summarize any contact info or submission instructions.
- If fields are present, explain what to write in each.

TEXT:
${clipped}
  `.trim();

  return aiOrHeuristics(
    prompt,
    async () =>
      `[DEMO] Steps:\n1) Read each section title.\n2) Fill your name and address.\n3) Provide required IDs.\n(Offline demo cannot fully parse/translate without API key.)`
  );
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // A) multipart/form-data (file upload from UI)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      const lang = (form.get("lang") as string) || "English";
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const name = (file.name || "").toLowerCase();
      const type = file.type || "";

      // TXT
      if (type === "text/plain" || name.endsWith(".txt")) {
        const text = await file.text();
        const output = await explain(text, lang);
        return NextResponse.json({ output });
      }

      // RTF
      if (type === "application/rtf" || name.endsWith(".rtf")) {
        const raw = await file.text();
        const text = stripRtf(raw);
        const output = await explain(text, lang);
        return NextResponse.json({ output });
      }

      // PDF
      if (type === "application/pdf" || name.endsWith(".pdf")) {
        const buf = Buffer.from(await file.arrayBuffer());
        const parsed = await pdfParse(buf);
        const output = await explain(parsed.text || "", lang);
        return NextResponse.json({ output });
      }

      return NextResponse.json(
        { error: `Unsupported file type: ${type || name}` },
        { status: 415 }
      );
    }

    // B) JSON body: { text?, url?, lang? }
    const body = await req.json().catch(() => ({} as any));
    const lang = body?.lang || "English";

    if (body?.text) {
      const output = await explain(String(body.text), lang);
      return NextResponse.json({ output });
    }

    if (body?.url) {
      const res = await fetch(body.url);
      const ct = res.headers.get("content-type") || "";
      const ab = await res.arrayBuffer();

      if (ct.includes("pdf") || body.url.toLowerCase().endsWith(".pdf")) {
        const parsed = await pdfParse(Buffer.from(ab));
        const output = await explain(parsed.text || "", lang);
        return NextResponse.json({ output });
      }

      if (ct.includes("rtf") || body.url.toLowerCase().endsWith(".rtf")) {
        const raw = Buffer.from(ab).toString("utf8");
        const text = stripRtf(raw);
        const output = await explain(text, lang);
        return NextResponse.json({ output });
      }

      // default: treat as text (txt/html)
      const text = Buffer.from(ab).toString("utf8");
      const output = await explain(text, lang);
      return NextResponse.json({ output });
    }

    return NextResponse.json(
      { error: "Send a file (multipart/form-data) or JSON with 'text' or 'url'." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
