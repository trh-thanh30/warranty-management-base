"use client";

import { useQuery } from "@tanstack/react-query";
import type { ListPublicProductsQuery } from "@repo/shared";
import { MAX_PAGE_SIZE } from "@repo/shared/constants";
import { productCategoriesService } from "@/src/services/product-categories/product-categories.service";
import { productsService } from "@/src/services/products/products.service";

const PRODUCT_CATEGORIES_STALE_TIME_MS = 5 * 60 * 1000;

export function useProductsCatalog(query: ListPublicProductsQuery) {
  const productsQuery = useQuery({
    queryKey: ["public-products", query],
    queryFn: ({ signal }) => productsService.listProducts(query, signal),
  });

  const categoriesQuery = useQuery({
    queryKey: ["public-product-categories", "catalog-filter"],
    queryFn: ({ signal }) =>
      productCategoriesService.listProductCategories(
        { page: 1, limit: MAX_PAGE_SIZE },
        signal,
      ),
    staleTime: PRODUCT_CATEGORIES_STALE_TIME_MS,
  });

  return { categoriesQuery, productsQuery };
}
