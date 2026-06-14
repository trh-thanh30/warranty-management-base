import { ShieldCheck, UserCheck, Users } from "lucide-react";
import type { AdminUserSummary } from "@repo/shared";

export const users: AdminUserSummary[] = [
  {
    email: "minh.tran@example.com",
    initials: "MT",
    lastSeen: "5 minutes ago",
    name: "Minh Tran",
    role: "Owner",
    status: "Active",
  },
  {
    email: "lan.nguyen@example.com",
    initials: "LN",
    lastSeen: "1 hour ago",
    name: "Lan Nguyen",
    role: "Operations",
    status: "Active",
  },
  {
    email: "an.pham@example.com",
    initials: "AP",
    lastSeen: "Yesterday",
    name: "An Pham",
    role: "Support",
    status: "Invited",
  },
];

export const userStats = [
  {
    description: "Can access admin",
    icon: Users,
    title: "Admin users",
    trend: "+3",
    value: "24",
  },
  {
    description: "Seen this week",
    icon: UserCheck,
    title: "Active operators",
    trend: "86%",
    value: "18",
  },
  {
    description: "Owner and admin roles",
    icon: ShieldCheck,
    title: "Privileged roles",
    trend: "Stable",
    value: "6",
  },
];
