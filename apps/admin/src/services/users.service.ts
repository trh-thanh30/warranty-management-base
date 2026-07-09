import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createUsersService,
  type UsersHttpClient,
} from "./create-users.service";

export const usersService = createUsersService(
  adminHttpClient as unknown as UsersHttpClient,
);
