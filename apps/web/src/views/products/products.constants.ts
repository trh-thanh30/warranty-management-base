import {
  catalogCategories,
  productCatalogItems,
} from "@/src/constants/product-catalog.constants";

export { catalogCategories };

export const expandedProductsCatalog = productCatalogItems;

export const pageSizeOptions = [5, 10, 15, 20] as const;
