import type { UserRole } from "../constants/index.ts";

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};
