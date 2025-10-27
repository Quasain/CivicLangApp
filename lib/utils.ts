export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}
export function detectLanguage(text: string): string {
  // naive language hinting for demo purposes
  if(/[\u3131-\uD79D]/.test(text)) return "ko";
  if(/[\u0600-\u06FF]/.test(text)) return "fa";
  if(/[\u4e00-\u9fa5]/.test(text)) return "zh";
  if(/[ñáéíóúü¿¡]/i.test(text)) return "es";
  return "en";
}
export const SUPPORTED = (process.env.CIVICLANG_LOCALES ?? "en,ko,zh,fa,es")
  .split(",").map(s => s.trim());
