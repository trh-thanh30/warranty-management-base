import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createCategoriesService,
  type CategoriesHttpClient,
} from "./create-categories.service";

export const categoriesService = createCategoriesService(
  adminHttpClient as unknown as CategoriesHttpClient,
);
