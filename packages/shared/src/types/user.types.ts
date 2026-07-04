import type { ApiUserRole, UserRole } from "../constants/index.ts";

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

export type ListUsersQuery = {
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
