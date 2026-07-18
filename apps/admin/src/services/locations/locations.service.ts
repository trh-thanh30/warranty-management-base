import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createLocationsService,
  type LocationsHttpClient,
} from "./create-locations.service";

export const locationsService = createLocationsService(
  adminHttpClient as unknown as LocationsHttpClient,
);
