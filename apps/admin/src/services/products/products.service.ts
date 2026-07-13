import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createProductsService,
  type ProductsHttpClient,
} from "./create-products.service";

export const productsService = createProductsService(
  adminHttpClient as unknown as ProductsHttpClient,
);
