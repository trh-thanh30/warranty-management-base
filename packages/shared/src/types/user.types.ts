import type { USER_ROLES } from "@/constants/index.js";

export type UserRole = (typeof USER_ROLES)[number];

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};
