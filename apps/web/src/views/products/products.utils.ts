import type { ListPublicProductsQuery } from "@repo/shared";

export const ALL_PRODUCT_CATEGORIES = "all";

export type ProductSortOption = "newest" | "name-asc" | "name-desc";

export type ProductsCatalogQueryInput = {
  categoryId: string;
  limit: number;
  page: number;
  search: string;
  sort: ProductSortOption;
};

export function buildPublicProductsQuery(
  input: ProductsCatalogQueryInput,
): ListPublicProductsQuery {
  const search = input.search.trim();
  const isNameSort = input.sort === "name-asc" || input.sort === "name-desc";

  return {
    page: input.page,
    limit: input.limit,
    ...(search ? { search } : {}),
    ...(input.categoryId !== ALL_PRODUCT_CATEGORIES
      ? { categoryId: input.categoryId }
      : {}),
    sortBy: isNameSort ? "name" : "publishedAt",
    sortOrder: input.sort === "name-asc" ? "asc" : "desc",
  };
}
