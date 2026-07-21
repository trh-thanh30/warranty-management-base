import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createServiceCentersService } from "./create-service-centers.service";
import type { ServiceCentersHttpClient } from "./service-centers.types";

export const serviceCentersService = createServiceCentersService(
  adminHttpClient as unknown as ServiceCentersHttpClient,
);
