export type PolicyKey =
  | "general"
  | "privacy"
  | "purchasing"
  | "warrantyReturn"
  | "shipping"
  | "payment";

export interface PolicySection {
  heading: string;
  bullets?: string[];
  paragraph?: string;
}

export interface PolicyDocument {
  title: string;
  lead: string;
  sections: PolicySection[];
}
