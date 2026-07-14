import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createWarrantyClaimsService } from "./create-warranty-claims.service";

export const warrantyClaimsService =
  createWarrantyClaimsService(adminHttpClient);
