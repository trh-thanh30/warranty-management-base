import { ClipboardList, PackagePlus, SearchCheck, Wrench } from "lucide-react";
import type {
  WarrantyActivationRequestSource,
  WarrantyActivationRequestStatus,
  WarrantyClaimPriority,
  WarrantyClaimStatus,
  WarrantyStatus,
} from "@repo/shared";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export const DASHBOARD_QUICK_RANGE_OPTIONS = [
  { days: 7, labelKey: "last7Days" },
  { days: 30, labelKey: "last30Days" },
] as const;

export type DashboardQuickRangeDays =
  (typeof DASHBOARD_QUICK_RANGE_OPTIONS)[number]["days"];

export function getDashboardQuickActions(t: Translate): Array<{
  description: string;
  href: string;
  icon: typeof PackagePlus;
  permission: PermissionKey;
  title: string;
}> {
  return [
    {
      description: t("quickActions.createProductDescription"),
      href: "/products/create",
      icon: PackagePlus,
      permission: PERMISSIONS.PRODUCT_CREATE,
      title: t("quickActions.createProduct"),
    },
    {
      description: t("quickActions.lookupWarrantyDescription"),
      href: "/warranties",
      icon: SearchCheck,
      permission: PERMISSIONS.WARRANTY_VIEW,
      title: t("quickActions.lookupWarranty"),
    },
    {
      description: t("quickActions.manageClaimsDescription"),
      href: "/warranty-claims",
      icon: ClipboardList,
      permission: PERMISSIONS.WARRANTY_CLAIM_VIEW,
      title: t("quickActions.manageClaims"),
    },
    {
      description: t("quickActions.serviceCentersDescription"),
      href: "/service-centers",
      icon: Wrench,
      permission: PERMISSIONS.SERVICE_CENTER_VIEW,
      title: t("quickActions.serviceCenters"),
    },
  ];
}

export const DASHBOARD_CLAIM_STATUS_ORDER: WarrantyClaimStatus[] = [
  "SUBMITTED",
  "REVIEWING",
  "APPROVED",
  "IN_REPAIR",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

export const DASHBOARD_CLAIM_STATUS_COLORS: Record<
  WarrantyClaimStatus,
  string
> = {
  SUBMITTED: "#64748b",
  REVIEWING: "#3b82f6",
  APPROVED: "#f59e0b",
  IN_REPAIR: "#06b6d4",
  COMPLETED: "#22c55e",
  REJECTED: "#ef4444",
  CANCELLED: "#f43f5e",
};

export const DASHBOARD_CLAIM_PRIORITY_ORDER: WarrantyClaimPriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

export const DASHBOARD_CLAIM_PRIORITY_COLORS: Record<
  WarrantyClaimPriority,
  string
> = {
  LOW: "#64748b",
  NORMAL: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

export const DASHBOARD_SERVICE_CENTER_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#14b8a6",
  "#10b981",
  "#f97316",
  "#ec4899",
] as const;

export const DASHBOARD_UNASSIGNED_SERVICE_CENTER_COLOR = "#64748b";
export const DASHBOARD_OTHER_SERVICE_CENTER_COLOR = "#a855f7";

export const DASHBOARD_WARRANTY_STATUS_ORDER: WarrantyStatus[] = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "VOIDED",
];

export const DASHBOARD_WARRANTY_STATUS_COLORS: Record<WarrantyStatus, string> =
  {
    DRAFT: "#64748b",
    ACTIVE: "#22c55e",
    EXPIRED: "#f59e0b",
    VOIDED: "#ef4444",
  };

export const DASHBOARD_ACTIVATION_REQUEST_STATUS_ORDER: WarrantyActivationRequestStatus[] =
  ["PENDING", "APPROVED", "ACTIVATED", "REJECTED", "CANCELLED"];

export const DASHBOARD_ACTIVATION_REQUEST_STATUS_COLORS: Record<
  WarrantyActivationRequestStatus,
  string
> = {
  PENDING: "#3b82f6",
  APPROVED: "#14b8a6",
  ACTIVATED: "#22c55e",
  REJECTED: "#ef4444",
  CANCELLED: "#64748b",
};

export const DASHBOARD_ACTIVATION_REQUEST_SOURCE_ORDER: WarrantyActivationRequestSource[] =
  ["PUBLIC_WEB", "ADMIN_PORTAL"];

export const DASHBOARD_ACTIVATION_REQUEST_SOURCE_COLORS: Record<
  WarrantyActivationRequestSource,
  string
> = {
  PUBLIC_WEB: "#2563eb",
  ADMIN_PORTAL: "#8b5cf6",
};
