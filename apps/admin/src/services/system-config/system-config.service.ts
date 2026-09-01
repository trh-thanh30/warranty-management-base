import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createSystemConfigService } from "./create-system-config.service";
import type { SystemConfigHttpClient } from "./system-config.types";

export const systemConfigService = createSystemConfigService(
  adminHttpClient as unknown as SystemConfigHttpClient,
);
