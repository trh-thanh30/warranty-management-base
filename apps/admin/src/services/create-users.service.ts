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

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

type RequestConfig = {
  params?: Record<string, unknown>;
};

export type UsersHttpClient = {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

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
