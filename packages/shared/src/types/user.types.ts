import type {
  ApiUserRole,
  PermissionKey,
  UserRole,
} from "../constants/index.ts";
import type { PaginationQuery } from "./pagination.types.ts";

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

export type ApiUserStatus = "ACTIVE" | "INACTIVE";

export type UserAccountSummary = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: ApiUserRole;
  status: ApiUserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListUsersQuery = PaginationQuery & {
  page?: number;
  limit?: number;
  search?: string;
  role?: ApiUserRole;
  roles?: string;
  status?: ApiUserStatus;
  sortBy?:
    | "email"
    | "username"
    | "fullName"
    | "phone"
    | "role"
    | "status"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CreateModeratorBody = {
  email: string;
  full_name: string;
  phone?: string;
  role: "MODERATOR";
  status?: ApiUserStatus;
  username: string;
};

export type CreateModeratorResponse = {
  temporaryPassword: string;
  user: UserAccountSummary;
};

export type UpdateModeratorBody = {
  email?: string;
  full_name?: string;
  password?: string;
  phone?: string | null;
  status?: ApiUserStatus;
  username?: string;
};

export type UserPermissionOverride = {
  permissionKey: PermissionKey;
  granted: boolean;
};

export type UserPermissionsResponse = {
  userId: string;
  role: UserRole | null;
  effectivePermissions: PermissionKey[];
  overrides: UserPermissionOverride[];
};

export type UpdateUserPermissionsBody = {
  overrides: UserPermissionOverride[];
};
