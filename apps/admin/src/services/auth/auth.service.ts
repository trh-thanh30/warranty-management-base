import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createAuthService } from "./create-auth.service";
import type { AuthHttpClient } from "./auth.types";

export const authService = createAuthService(
  adminHttpClient as unknown as AuthHttpClient,
);
