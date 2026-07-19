import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createWarrantyActivationRequestsService } from "./create-warranty-activation-requests.service";

export const warrantyActivationRequestsService =
  createWarrantyActivationRequestsService(adminHttpClient);
