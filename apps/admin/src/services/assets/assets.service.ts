import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createAssetsService,
  type AssetsHttpClient,
} from "./create-assets.service";

export const assetsService = createAssetsService(
  adminHttpClient as unknown as AssetsHttpClient,
);
