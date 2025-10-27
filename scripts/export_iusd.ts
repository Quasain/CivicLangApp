import path from "node:path";
import { load } from "cheerio";
import pdfParse from "pdf-parse";
import { CivicDoc } from "./schema";
import { DATA_DIR, httpText, httpBuffer, saveJSON, saveRaw, sha1 } from "./io";

const SOURCE = "iusd";
const BASE = "https://iusd.org";
const PAGES = [
  "/enrollment",
  "/parents",
  "/calendar",
];
const PDFS: string[] = [
  // Add relative or absolute PDF URLs here
];

function clean($: any) {
  $("script,style,nav,footer,header,svg").remove();
  const main = $("main");
  const text = (main.text() || $("body").text() || "")
    .replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

async function exportIUSD() {
  const out: CivicDoc[] = [];
  for (const rel of PAGES) {
    const url = BASE + rel;
    const html = await httpText(url);
    saveRaw(path.join(DATA_DIR, SOURCE, "raw", sha1(url) + ".html"), Buffer.from(html, "utf8"));
    const $ = load(html);
    const title = ($("meta[property='og:title']").attr("content") || $("title").text() || "").trim();
    const text = clean($);
    if (!text) continue;
    out.push({
      id: sha1(url), source: SOURCE, url, title,
      section: $("h1").first().text().trim() || undefined,
      lang: $("html").attr("lang") || "en",
      updatedAt: new Date().toISOString(),
      text
    });
  }
  for (const rel of PDFS) {
    const url = rel.startsWith("http") ? rel : BASE + rel;
    const buf = await httpBuffer(url);
    saveRaw(path.join(DATA_DIR, SOURCE, "raw", sha1(url) + ".pdf"), buf);
    const pdf = await pdfParse(buf);
    const text = pdf.text.replace(/\s+\n/g, "\n").trim();
    out.push({
      id: sha1(url), source: SOURCE, url, title: "IUSD Form",
      section: "Forms", lang: "en", updatedAt: new Date().toISOString(), text
    });
  }
  saveJSON(path.join(DATA_DIR, SOURCE, "index.json"), out);
  console.log(`Wrote ${out.length} docs -> data/${SOURCE}/index.json`);
}
exportIUSD().catch(e => { console.error(e); process.exit(1); });