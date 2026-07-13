import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createWarrantiesService,
  type WarrantiesHttpClient,
} from "./create-warranties.service";

export const warrantiesService = createWarrantiesService(
  adminHttpClient as unknown as WarrantiesHttpClient,
);
