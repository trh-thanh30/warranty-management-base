import type { ContentPageStatus } from "@repo/shared";
import { z } from "zod";

const trimmedText = z.string().trim();

const richText = (maxLength: number, requiredMessage: string) =>
  z
    .string()
    .refine(
      (value) =>
        getRichTextPlainText(value).length > 0 && value.length <= maxLength,
      { message: requiredMessage },
    );

const faqItemSchema = z.object({
  id: z.string().uuid().optional(),
  question: trimmedText
    .min(2, "faqQuestionRequired")
    .max(300, "faqQuestionLength"),
  answer: richText(10_000, "faqAnswerRequired"),
  isActive: z.boolean(),
});

export const contentPageFormSchema = z
  .object({
    slug: trimmedText
      .min(2, "slugRequired")
      .max(120, "slugLength")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugInvalid"),
    title: trimmedText.min(2, "titleRequired").max(255, "titleLength"),
    summary: trimmedText.max(500, "summaryLength"),
    content: z.string().max(20_000, "contentRequired"),
    faqItems: z.array(faqItemSchema).max(100, "faqItemsLength"),
    kind: z.enum([
      "GENERAL_POLICY",
      "PRIVACY_POLICY",
      "PURCHASE_POLICY",
      "WARRANTY_RETURN_POLICY",
      "SHIPPING_POLICY",
      "PAYMENT_POLICY",
      "FAQ",
    ]),
    categoryId: z.string().uuid("categoryInvalid").or(z.literal("")),
  })
  .superRefine((value, context) => {
    if (value.kind === "FAQ") {
      if (value.faqItems.length === 0) {
        context.addIssue({
          code: "custom",
          message: "faqItemsRequired",
          path: ["faqItems"],
        });
      }
      return;
    }

    if (!getRichTextPlainText(value.content)) {
      context.addIssue({
        code: "custom",
        message: "contentRequired",
        path: ["content"],
      });
    }
  });

function getRichTextPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export type ContentPageFormValues = z.infer<typeof contentPageFormSchema>;
export type ContentPageKindFilter = "ALL" | ContentPageFormValues["kind"];
export type ContentPageStatusFilter = "ALL" | ContentPageStatus;
