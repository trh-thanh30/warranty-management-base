import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createContentPagesService,
  type ContentPagesHttpClient,
} from "./create-content-pages.service";

export const contentPagesService = createContentPagesService(
  adminHttpClient as unknown as ContentPagesHttpClient,
);
