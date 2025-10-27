export type CivicDoc = {
  id: string;
  source: "cityofirvine" | "data_ca_gov" | "iusd" | "ocvote";
  url: string;
  title?: string;
  section?: string;
  lang?: string;
  updatedAt?: string;
  text: string;
  html?: string;
  tags?: string[];
  meta?: Record<string, any>;
};