import type {
  CreateModeratorBody,
  CreateModeratorResponse,
  ListUsersQuery,
  PaginatedResponse,
  UpdateModeratorBody,
  UpdateUserPermissionsBody,
  UserAccountSummary,
  UserPermissionsResponse,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { UsersHttpClient } from "./users.types";

export function createUsersService(http: UsersHttpClient) {
  return {
    async listModerators(
      query: Omit<ListUsersQuery, "role" | "roles">,
    ): Promise<PaginatedResponse<UserAccountSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<UserAccountSummary>>("/users", {
          params: {
            ...query,
            role: "MODERATOR",
          },
        }),
      );
    },

    async createModerator(
      body: CreateModeratorBody,
    ): Promise<CreateModeratorResponse> {
      return unwrap(await http.post<CreateModeratorResponse>("/users", body));
    },

    async getModerator(userId: string): Promise<UserAccountSummary | null> {
      const user = unwrap(
        await http.get<UserAccountSummary | null>(`/users/${userId}`),
      );

      return user?.role === "MODERATOR" ? user : null;
    },

    async updateModerator(
      userId: string,
      body: UpdateModeratorBody,
    ): Promise<UserAccountSummary> {
      return unwrap(
        await http.put<UserAccountSummary>(`/users/${userId}`, body),
      );
    },

    async getPermissions(userId: string): Promise<UserPermissionsResponse> {
      return unwrap(
        await http.get<UserPermissionsResponse>(`/users/${userId}/permissions`),
      );
    },

    async updatePermissions(
      userId: string,
      body: UpdateUserPermissionsBody,
    ): Promise<UserPermissionsResponse> {
      return unwrap(
        await http.put<UserPermissionsResponse>(
          `/users/${userId}/permissions`,
          body,
        ),
      );
    },
  };
}
