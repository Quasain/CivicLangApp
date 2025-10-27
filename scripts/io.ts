import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { request } from "undici";

export const DATA_DIR = "data";

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}
export function saveJSON(filePath: string, data: any) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
export function saveRaw(filePath: string, buf: Buffer) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, buf);
}
export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}
export async function httpText(url: string, headers: Record<string, string> = {}) {
  const res = await request(url, { headers: { "User-Agent": "CivicLang/1.0 (+contact@example.org)", ...headers } });
  if (res.statusCode >= 400) throw new Error(`GET ${url} -> ${res.statusCode}`);
  return await res.body.text();
}
export async function httpBuffer(url: string) {
  const res = await request(url, { headers: { "User-Agent": "CivicLang/1.0 (+contact@example.org)" } });
  if (res.statusCode >= 400) throw new Error(`GET ${url} -> ${res.statusCode}`);
  return Buffer.from(await res.body.arrayBuffer());
}