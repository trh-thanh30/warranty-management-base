import {
  Activity,
  CalendarCheck,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  TriangleAlert,
  User,
  Users,
} from "lucide-react";
import type { DashboardConfig } from "./dashboard.types";

type Translate = (key: string) => string;

export function getDashboardConfig(t: Translate): DashboardConfig {
  return {
    brand: {
      name: "Booking Admin",
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
          },
          {
            title: t("items.bookings"),
            href: "/bookings",
            icon: CalendarCheck,
          },
          {
            title: t("items.users"),
            href: "/users",
            icon: Users,
          },
          {
            title: t("items.chats"),
            badge: "3",
            icon: MessageSquare,
          },
          {
            title: t("items.securedByAuth"),
            icon: ShieldCheck,
          },
        ],
      },
      {
        label: t("sections.pages"),
        items: [
          {
            title: t("items.auth"),
            icon: ShieldCheck,
          },
          {
            title: t("items.errors"),
            icon: TriangleAlert,
          },
        ],
      },
      {
        label: t("sections.other"),
        items: [
          {
            title: t("items.system"),
            href: "/system",
            icon: Activity,
          },
          {
            title: t("items.settings"),
            href: "/settings",
            icon: Settings,
          },
          {
            title: t("items.helpCenter"),
            icon: CircleHelp,
          },
        ],
      },
    ],
    topNavigation: [
      {
        title: t("items.overview"),
        href: "/dashboard",
      },
      {
        title: t("items.customers"),
        href: "/users",
      },
      {
        title: t("items.bookings"),
        href: "/bookings",
      },
      {
        title: t("items.settings"),
        href: "/settings",
      },
    ],
    userMenu: {
      name: "Admin",
      email: "admin@example.com",
      avatarFallback: "AD",
      menuItems: [
        {
          label: t("items.profile"),
          href: "/settings", // or a profile subpage
          icon: User,
        },
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
