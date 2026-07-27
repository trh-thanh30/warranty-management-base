import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createProductTemplatesService } from "./create-product-templates.service";
import type { ProductTemplatesHttpClient } from "./product-templates.types";

export const productTemplatesService = createProductTemplatesService(
  adminHttpClient as unknown as ProductTemplatesHttpClient,
);
