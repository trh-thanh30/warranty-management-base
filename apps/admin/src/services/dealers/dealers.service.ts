import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createDealersService } from "./create-dealers.service";
import type { DealersHttpClient } from "./dealers.types";

export const dealersService = createDealersService(
  adminHttpClient as unknown as DealersHttpClient,
);
