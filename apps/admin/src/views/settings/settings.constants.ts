export const settingsTabs = [
  {
    label: "General",
    value: "general",
  },
  {
    label: "Notifications",
    value: "notifications",
  },
  {
    label: "Security",
    value: "security",
  },
] as const;

export const notificationSettings = [
  "Booking status changes",
  "Failed system checks",
  "New user invitations",
];

export const securitySettings = [
  "Require two-step verification for owners",
  "Expire inactive sessions",
  "Audit privileged role changes",
];
