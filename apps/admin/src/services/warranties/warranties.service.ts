import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createWarrantiesService } from "./create-warranties.service";
import type { WarrantiesHttpClient } from "./warranties.types";

export const warrantiesService = createWarrantiesService(
  adminHttpClient as unknown as WarrantiesHttpClient,
);
