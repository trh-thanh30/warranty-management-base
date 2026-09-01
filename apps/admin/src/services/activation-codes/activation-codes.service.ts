import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createActivationCodesService } from "./create-activation-codes.service";
import type { ActivationCodesHttpClient } from "./activation-codes.types";

export const activationCodesService = createActivationCodesService(
  adminHttpClient as unknown as ActivationCodesHttpClient,
);
