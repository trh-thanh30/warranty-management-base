import { PERMISSIONS } from "@repo/shared/constants";
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  UserRound,
  Users,
} from "lucide-react";
import type { DashboardConfig } from "./dashboard.types";

type Translate = (key: string) => string;

export function getDashboardConfig(t: Translate): DashboardConfig {
  return {
    brand: {
      name: "Warranty Admin",
      description: t("brandDescription"),
      logo: ClipboardList,
    },
    sidebarSections: [
      {
        label: t("sections.general"),
        items: [
          {
            title: t("items.dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
            requiredPermission: PERMISSIONS.DASHBOARD_VIEW,
          },
          {
            title: t("items.users"),
            href: "/staffs",
            icon: Users,
            requiredPermission: PERMISSIONS.USER_VIEW,
            requiredRole: "admin",
          },
          {
            title: t("items.customers"),
            href: "/customers",
            icon: UserRound,
            requiredPermission: PERMISSIONS.CUSTOMER_VIEW,
          },
          {
            title: t("items.categories"),
            href: "/categories",
            icon: Tags,
            requiredPermission: PERMISSIONS.CATEGORY_VIEW,
          },
          {
            title: t("items.products"),
            href: "/products",
            icon: Package,
            requiredPermission: PERMISSIONS.PRODUCT_VIEW,
          },
          {
            title: t("items.warranties"),
            href: "/warranties",
            activeHrefs: ["/warranty-activation-requests"],
            icon: ShieldCheck,
            requiredPermission: PERMISSIONS.WARRANTY_VIEW,
          },
          {
            title: t("items.warrantyClaims"),
            href: "/warranty-claims",
            icon: ClipboardList,
            requiredPermission: PERMISSIONS.WARRANTY_CLAIM_VIEW,
          },
          {
            title: t("items.serviceCenters"),
            href: "/service-centers",
            icon: Building2,
            requiredPermission: PERMISSIONS.SERVICE_CENTER_VIEW,
          },
          {
            title: t("items.dealers"),
            href: "/dealers",
            icon: Store,
            requiredPermission: PERMISSIONS.DEALER_VIEW,
          },
        ],
      },
      {
        label: t("sections.other"),
        items: [
          {
            title: t("items.contentPages"),
            href: "/content-pages",
            icon: FileText,
            requiredPermission: PERMISSIONS.CONTENT_PAGE_VIEW,
          },
          {
            title: t("items.notifications"),
            href: "/notifications",
            icon: Bell,
          },
          {
            title: t("items.settings"),
            href: "/settings",
            icon: Settings,
          },
        ],
      },
    ],
    topNavigation: [
      {
        title: t("items.overview"),
        href: "/dashboard",
        requiredPermission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: t("items.users"),
        href: "/staffs",
        requiredPermission: PERMISSIONS.USER_VIEW,
        requiredRole: "admin",
      },
      {
        title: t("items.customers"),
        href: "/customers",
        requiredPermission: PERMISSIONS.CUSTOMER_VIEW,
      },
      {
        title: t("items.categories"),
        href: "/categories",
        requiredPermission: PERMISSIONS.CATEGORY_VIEW,
      },
      {
        title: t("items.products"),
        href: "/products",
        requiredPermission: PERMISSIONS.PRODUCT_VIEW,
      },
      {
        title: t("items.warranties"),
        href: "/warranties",
        requiredPermission: PERMISSIONS.WARRANTY_VIEW,
      },
      {
        title: t("items.warrantyClaims"),
        href: "/warranty-claims",
        requiredPermission: PERMISSIONS.WARRANTY_CLAIM_VIEW,
      },
      {
        title: t("items.serviceCenters"),
        href: "/service-centers",
        requiredPermission: PERMISSIONS.SERVICE_CENTER_VIEW,
      },
      {
        title: t("items.dealers"),
        href: "/dealers",
        requiredPermission: PERMISSIONS.DEALER_VIEW,
      },
      {
        title: t("items.contentPages"),
        href: "/content-pages",
        requiredPermission: PERMISSIONS.CONTENT_PAGE_VIEW,
      },
      {
        title: t("items.settings"),
        href: "/settings",
      },
    ],
    userMenu: {
      menuItems: [
        {
          label: t("items.settings"),
          href: "/settings",
          icon: Settings,
        },
        {
          label: t("items.signOut"),
          href: "/auth/logout", // typical logout URL
          icon: LogOut,
          isDestructive: true,
        },
      ],
    },
  };
}
