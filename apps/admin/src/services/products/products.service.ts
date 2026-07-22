import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createProductsService } from "./create-products.service";
import type { ProductsHttpClient } from "./products.types";

export const productsService = createProductsService(
  adminHttpClient as unknown as ProductsHttpClient,
);
