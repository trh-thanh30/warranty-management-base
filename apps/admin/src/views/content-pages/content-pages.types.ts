import { z } from "zod";

const trimmedText = z.string().trim();

export const contentPageFormSchema = z.object({
  slug: trimmedText
    .min(2, "slugRequired")
    .max(120, "slugLength")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugInvalid"),
  title: trimmedText.min(2, "titleRequired").max(255, "titleLength"),
  summary: trimmedText.max(500, "summaryLength"),
  content: z.string().refine(
    (value) => {
      const text = value
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      return text.length > 0 && value.length <= 20_000;
    },
    { message: "contentRequired" },
  ),
  kind: z.enum(["POLICY", "GUIDE", "INTRO", "FAQ"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type ContentPageFormValues = z.infer<typeof contentPageFormSchema>;
export type ContentPageKindFilter = "ALL" | ContentPageFormValues["kind"];
export type ContentPageStatusFilter = "ALL" | ContentPageFormValues["status"];
