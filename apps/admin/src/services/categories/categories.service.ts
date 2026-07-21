import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createCategoriesService } from "./create-categories.service";
import type { CategoriesHttpClient } from "./categories.types";

export const categoriesService = createCategoriesService(
  adminHttpClient as unknown as CategoriesHttpClient,
);
