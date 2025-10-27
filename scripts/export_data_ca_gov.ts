import path from "node:path";
import { CivicDoc } from "./schema";
import { DATA_DIR, httpText, httpBuffer, saveJSON, saveRaw, sha1 } from "./io";

const SOURCE = "data_ca_gov";
// TODO: Replace with real CKAN dataset IDs
const DATASETS: string[] = [
  // "example-dataset-id"
];

async function getPackage(id: string) {
  const url = `https://data.ca.gov/api/3/action/package_show?id=${encodeURIComponent(id)}`;
  const json = JSON.parse(await httpText(url));
  if (!json.success) throw new Error("CKAN package_show failed");
  return json.result;
}

function normalizeRecordToText(obj: any) {
  return Object.entries(obj).map(([k, v]) => `${k}: ${String(v ?? "")}`).join("\n");
}

async function exportDataCaGov() {
  const out: CivicDoc[] = [];
  for (const id of DATASETS) {
    const pack = await getPackage(id);
    for (const res of pack.resources) {
      const resUrl: string = res.url;
      const format = String((res.format || "").toLowerCase());
      const resId = sha1(resUrl);
      const rawPath = path.join(DATA_DIR, SOURCE, "raw", `${resId}.${format || "dat"}`);
      const buf = await httpBuffer(resUrl);
      saveRaw(rawPath, buf);

      if (format === "csv" || resUrl.endsWith(".csv")) {
        const text = buf.toString("utf8");
        const lines = text.split(/\r?\n/).slice(0, 200).join("\n");
        out.push({
          id: resId,
          source: SOURCE,
          url: resUrl,
          title: pack.title,
          section: res.name,
          lang: "en",
          updatedAt: new Date().toISOString(),
          text: lines,
          meta: { dataset_id: id, resource_id: res.id, format: "csv" }
        });
      } else if (format === "json" || resUrl.endsWith(".json")) {
        const json = JSON.parse(buf.toString("utf8"));
        const sample = Array.isArray(json) ? json.slice(0, 20) : [json];
        const asText = sample.map(normalizeRecordToText).join("\n\n---\n\n");
        out.push({
          id: resId,
          source: SOURCE,
          url: resUrl,
          title: pack.title,
          section: res.name,
          lang: "en",
          updatedAt: new Date().toISOString(),
          text: asText,
          meta: { dataset_id: id, resource_id: res.id, format: "json" }
        });
      } else {
        out.push({
          id: resId,
          source: SOURCE,
          url: resUrl,
          title: pack.title,
          section: res.name,
          lang: "en",
          updatedAt: new Date().toISOString(),
          text: `Resource (${format || "unknown"}) downloaded. See raw file at ${rawPath}.`,
          meta: { dataset_id: id, resource_id: res.id, format }
        });
      }
    }
  }
  saveJSON(path.join(DATA_DIR, SOURCE, "index.json"), out);
  console.log(`Wrote ${out.length} docs -> data/${SOURCE}/index.json`);
}
exportDataCaGov().catch(e => { console.error(e); process.exit(1); });