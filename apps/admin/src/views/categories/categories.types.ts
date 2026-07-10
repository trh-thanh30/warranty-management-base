import type { CategoryType } from "@repo/shared";
import { z } from "zod";
import type { CATEGORY_STATUS_FILTERS } from "./categories.constants";

export type CategoryStatusFilter = (typeof CATEGORY_STATUS_FILTERS)[number];

export type CategoryTypeFilter = "ALL" | CategoryType;

const optionalText = z.string().trim();

export const categoryFormSchema = z.object({
  code: optionalText.refine(
    (value) => value.length === 0 || /^[A-Z0-9_-]{1,64}$/i.test(value),
    {
      message: "codeInvalid",
    },
  ),
  description: optionalText.max(500, "descriptionLength"),
  icon: optionalText.max(80, "iconLength"),
  imageUrl: optionalText.max(500, "imageUrlLength"),
  isActive: z.boolean(),
  metadata: z.string(),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  order: z.coerce.number().int("orderInteger"),
  parentId: z.string(),
  slug: optionalText.refine(
    (value) => value.length === 0 || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    {
      message: "slugInvalid",
    },
  ),
  type: z.enum(["PRODUCT", "CONTENT_PAGE", "ASSET", "WARRANTY_CLAIM_ISSUE"]),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
