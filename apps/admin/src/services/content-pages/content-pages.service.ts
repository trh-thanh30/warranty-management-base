import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createContentPagesService } from "./create-content-pages.service";
import type { ContentPagesHttpClient } from "./content-pages.types";

export const contentPagesService = createContentPagesService(
  adminHttpClient as unknown as ContentPagesHttpClient,
);
