import { PERMISSIONS } from "@repo/shared/constants";
import {
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  FileCheck2,
  FileText,
  Globe2,
  LayoutDashboard,
  Layers3,
  LogOut,
  HardDrive,
  MessageSquareText,
  Navigation,
  Package,
  PanelsTopLeft,
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
      name: t("brandName"),
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
            icon: Package,
            children: [
              {
                title: t("items.productTemplates"),
                href: "/product-templates",
                icon: Layers3,
                requiredPermission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
              },
              {
                title: t("items.products"),
                href: "/products",
                icon: Boxes,
                requiredPermission: PERMISSIONS.PRODUCT_VIEW,
              },
            ],
          },
          {
            title: t("items.warranties"),
            icon: ShieldCheck,
            children: [
              {
                title: t("items.warranties"),
                href: "/warranties",
                icon: ShieldCheck,
                requiredPermission: PERMISSIONS.WARRANTY_VIEW,
              },
              {
                title: t("items.warrantyActivationRequests"),
                href: "/warranty-activation-requests",
                icon: FileCheck2,
                notificationBadgeKey: "warranties",
                requiredPermission: PERMISSIONS.WARRANTY_VIEW,
              },
            ],
          },
          {
            title: t("items.warrantyClaims"),
            href: "/warranty-claims",
            icon: ClipboardList,
            notificationBadgeKey: "warrantyClaims",
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
          {
            title: t("items.contactSubmissions"),
            href: "/contact-submissions",
            icon: MessageSquareText,
            requiredPermission: PERMISSIONS.CONTACT_SUBMISSION_VIEW,
          },
        ],
      },
      {
        label: t("sections.website"),
        items: [
          {
            title: t("items.websiteConfig"),
            icon: Globe2,
            requiredPermission: PERMISSIONS.WEBSITE_CONFIG_VIEW,
            children: [
              {
                title: t("items.websiteOverview"),
                href: "/website-config",
                icon: LayoutDashboard,
                requiredPermission: PERMISSIONS.WEBSITE_CONFIG_VIEW,
              },
              {
                title: t("items.websiteSite"),
                href: "/website-config/site",
                icon: PanelsTopLeft,
                requiredPermission: PERMISSIONS.WEBSITE_CONFIG_VIEW,
              },
              {
                title: t("items.websiteNavigation"),
                href: "/website-config/navigation",
                icon: Navigation,
                requiredPermission: PERMISSIONS.WEBSITE_CONFIG_VIEW,
              },
            ],
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
            title: t("items.system"),
            href: "/system",
            icon: HardDrive,
            requiredPermission: PERMISSIONS.SYSTEM_VIEW,
            requiredRole: "admin",
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
        permissionHrefs: [
          {
            permission: PERMISSIONS.PRODUCT_VIEW,
            href: "/products",
          },
          {
            permission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
            href: "/product-templates",
          },
        ],
        requiredAnyPermissions: [
          PERMISSIONS.PRODUCT_VIEW,
          PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
        ],
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
        title: t("items.websiteOverview"),
        href: "/website-config",
        requiredPermission: PERMISSIONS.WEBSITE_CONFIG_VIEW,
      },
      {
        title: t("items.contactSubmissions"),
        href: "/contact-submissions",
        requiredPermission: PERMISSIONS.CONTACT_SUBMISSION_VIEW,
      },
      {
        title: t("items.system"),
        href: "/system",
        requiredPermission: PERMISSIONS.SYSTEM_VIEW,
        requiredRole: "admin",
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
