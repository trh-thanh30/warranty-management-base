export const USER_ROLES = ["admin", "moderator", "customer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const API_USER_ROLES = ["ADMIN", "MODERATOR", "CUSTOMER"] as const;

export type ApiUserRole = (typeof API_USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  moderator: "Moderator",
  customer: "Customer",
};

export function normalizeUserRole(
  role: string | null | undefined,
): UserRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.toLowerCase();
  return USER_ROLES.includes(normalized as UserRole)
    ? (normalized as UserRole)
    : null;
}
