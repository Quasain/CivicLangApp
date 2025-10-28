import { load } from "cheerio";
import path from "node:path";
import { CivicDoc } from "./schema";
import { DATA_DIR, httpText, saveJSON, saveRaw, sha1 } from "./io";

const SOURCE = "cityofirvine";
const BASE = "https://cityofirvine.org";

const PAGES = [
  "/services",
  "/awards",
  "/city-clerk/passport-services",
  "/live/new-irvine",
  "/diversity-equity-and-inclusion",
  "/child-care-development/child-care-scholarships",
  "/child-care-development/financial-assistance-child-care",
  "/child-care-development/parenting-resources",
  "/irvine-gives/children-youth-families",
  "/seek-assistance/financial-aid-food-pantries-rental-assistance",
  "/seek-assistance/health-care-resources",
  "/seek-assistance/families-247-hotlines",
  "/child-care-development/irvine-child-care-project",
];

function cleanText($: any) {
  $("script,style,nav,footer,header,svg").remove();
  const main = $("main");
  const text = (main.text() || $("body").text() || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

async function exportCity() {
  const out: CivicDoc[] = [];
  for (const rel of PAGES) {
    const url = BASE + rel;
    const html = await httpText(url);
    saveRaw(path.join(DATA_DIR, SOURCE, "raw", sha1(url) + ".html"), Buffer.from(html, "utf8"));
    const $ = load(html);
    const title = ($("meta[property='og:title']").attr("content") || $("title").text() || "").trim();
    const text = cleanText($);
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
      meta: { path: rel }
    });
  }
  saveJSON(path.join(DATA_DIR, SOURCE, "index.json"), out);
  console.log(`Wrote ${out.length} docs -> data/${SOURCE}/index.json`);
}
exportCity().catch(e => { console.error(e); process.exit(1); });