export const CATEGORY_TYPES = [
  "PRODUCT",
  "CONTENT_PAGE",
  "ASSET",
  "WARRANTY_CLAIM_ISSUE",
] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export function isCategoryType(value: string): value is CategoryType {
  return CATEGORY_TYPES.some((type) => type === value);
}

export const PRODUCT_CATEGORIES = [
  "CAR",
  "ACCESSORY",
  "SPARE_PART",
  "SERVICE_PACKAGE",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value);
}
