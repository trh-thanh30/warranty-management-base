import { z } from "zod";
import {
  CATEGORY_TYPES,
  type ManageableCategoryType,
  type CATEGORY_STATUS_FILTERS,
} from "./categories.constants";

export type CategoryStatusFilter = (typeof CATEGORY_STATUS_FILTERS)[number];

export type CategoryTypeFilter = ManageableCategoryType;

const optionalText = z.string().trim();

export const categoryFormSchema = z.object({
  code: optionalText.refine(
    (value) => value.length === 0 || /^[A-Z0-9_-]{1,64}$/i.test(value),
    {
      message: "codeInvalid",
    },
  ),
  description: optionalText.max(500, "descriptionLength"),
  imageUrl: optionalText.max(500, "imageUrlLength"),
  isActive: z.boolean(),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  order: z.coerce.number().int("orderInteger"),
  parentId: z.string(),
  slug: optionalText.refine(
    (value) => value.length === 0 || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    {
      message: "slugInvalid",
    },
  ),
  type: z.enum(CATEGORY_TYPES),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
