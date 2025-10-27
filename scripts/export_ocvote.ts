import path from "node:path";
import { load } from "cheerio";
import { CivicDoc } from "./schema";
import { DATA_DIR, httpText, saveJSON, saveRaw, sha1 } from "./io";

const SOURCE = "ocvote";
const BASE = "https://www.ocvote.gov";
const PAGES = [
  "/voting",                                  // overview
  "/voting/voting-in-person",                 // in-person options
  "/voting/voting-at-home",                   // ballot return options
  "/voting/vote-by-mail-voting",              // vote-by-mail info
  "/registration",                            // registration hub
  "/elections/vote-center-locations",         // vote centers (listing page)
  "/elections/ballot-drop-box-locations",     // ballot drop boxes
];

function toText($: any) {
  $("script,style,nav,footer,header,svg").remove();
  const text = ($("main").text() || $("body").text() || "")
    .replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

async function exportOCVote() {
  const out: CivicDoc[] = [];
  for (const rel of PAGES) {
    const url = BASE + rel;
    const html = await httpText(url);
    saveRaw(path.join(DATA_DIR, SOURCE, "raw", sha1(url) + ".html"), Buffer.from(html, "utf8"));
    const $ = load(html);
    const title = ($("meta[property='og:title']").attr("content") || $("title").text() || "").trim();
    const text = toText($);
    if (!text) continue;
    out.push({
      id: sha1(url),
      source: SOURCE,
      url,
      title,
      section: $("h1").first().text().trim() || undefined,
      lang: $("html").attr("lang") || "en",
      updatedAt: new Date().toISOString(),
      text,
      tags: ["elections","ocvote"]
    });
  }
  saveJSON(path.join(DATA_DIR, SOURCE, "index.json"), out);
  console.log(`Wrote ${out.length} docs -> data/${SOURCE}/index.json`);
}
exportOCVote().catch(e => { console.error(e); process.exit(1); });