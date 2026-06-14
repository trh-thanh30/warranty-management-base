export type AdminUserStatus = "Active" | "Invited";

export type AdminUserSummary = {
  email: string;
  initials: string;
  lastSeen: string;
  name: string;
  role: string;
  status: AdminUserStatus;
};
