// lib/rag.ts
import fs from "node:fs";
import path from "node:path";

import faqs from "@/data/faqs.json";
import glossary from "@/data/irvine_glossary.json";

export type RAGDoc = { id: string; text: string; source: string };

// --- helpers to load exported JSONs from /data/<source>/index.json ---
type ExportedDoc = {
  id?: string;
  url?: string;
  title?: string;
  text: string;
  source?: string;      // e.g., "ocvote"
  section?: string;
  tags?: string[];
};

function tryLoad(sourceFolder: string): ExportedDoc[] {
  const p = path.join(process.cwd(), "data", sourceFolder, "index.json");
  if (!fs.existsSync(p)) return [];
  try {
    const raw = fs.readFileSync(p, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

function shorten(s: string, n = 800) {
  if (!s) return "";
  return s.length <= n ? s : s.slice(0, n) + "…";
}

// Map exported docs into your simple RAGDoc shape
function exportedAsRag(sourceFolder: string, docs: ExportedDoc[]): RAGDoc[] {
  return docs.map((d, i) => {
    const title = d.title?.trim() || "Untitled";
    const url = d.url || "";
    const header = url ? `${title} — ${url}` : title;
    return {
      id: `${sourceFolder}-${d.id || i}`,
      text: `${header}\n\n${shorten(d.text || "")}`,
      source: sourceFolder, // keep folder name as source label
    };
  });
}

// --- build the unified corpus (FAQ + glossary + exported civic data) ---
const civicDocs: RAGDoc[] = [
  // your existing data:
  ...faqs.map((f: any, i: number) => ({
    id: `faq-${i}`,
    text: `${f.q} ${f.a}`,
    source: "faqs.json",
  })),
  ...Object.entries(glossary as Record<string, string>).map(([k, v], i) => ({
    id: `glossary-${i}`,
    text: `${k}: ${v}`,
    source: "irvine_glossary.json",
  })),

  // newly exported sources (present only if you've run the exporters)
  ...exportedAsRag("cityofirvine", tryLoad("cityofirvine")),
  ...exportedAsRag("iusd",         tryLoad("iusd")),
  ...exportedAsRag("ocvote",       tryLoad("ocvote")),
  ...exportedAsRag("data_ca_gov",  tryLoad("data_ca_gov")),
];

// --- same simple keyword scoring you already use ---
function score(query: string, text: string) {
  const q = query.toLowerCase().split(/\W+/).filter(Boolean);
  const t = text.toLowerCase();
  return q.reduce((acc, term) => acc + (t.includes(term) ? 1 : 0), 0);
}

export function retrieve(query: string, k = 5) {
  return civicDocs
    .map(d => ({ ...d, s: score(query, d.text) }))
    .filter(d => d.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k);
}

export function contextFor(query: string) {
  const hits = retrieve(query, 5);
  // format: one bullet per hit, keep URLs visible when present
  return hits
    .map(h => `- (${h.source}) ${h.text}`)
    .join("\n");
}
