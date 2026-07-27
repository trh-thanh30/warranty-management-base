import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createWebsiteConfigService } from "./create-website-config.service";
import type { WebsiteConfigHttpClient } from "./website-config.types";

export const websiteConfigService = createWebsiteConfigService(
  adminHttpClient as unknown as WebsiteConfigHttpClient,
);
