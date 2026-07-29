import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createLocationsService } from "./create-locations.service";
import type { LocationsHttpClient } from "./locations.types";

export const locationsService = createLocationsService(
  adminHttpClient as unknown as LocationsHttpClient,
);
