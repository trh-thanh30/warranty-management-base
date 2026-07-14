import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createServiceCentersService,
  type ServiceCentersHttpClient,
} from "./create-service-centers.service";

export const serviceCentersService = createServiceCentersService(
  adminHttpClient as unknown as ServiceCentersHttpClient,
);
