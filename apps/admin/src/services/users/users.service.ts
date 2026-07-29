import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createUsersService } from "./create-users.service";
import type { UsersHttpClient } from "./users.types";

export const usersService = createUsersService(
  adminHttpClient as unknown as UsersHttpClient,
);
