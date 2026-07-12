import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createAuthService, type AuthHttpClient } from "./create-auth.service";

export const authService = createAuthService(
  adminHttpClient as unknown as AuthHttpClient,
);
