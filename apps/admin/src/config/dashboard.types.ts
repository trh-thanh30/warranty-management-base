import type { ComponentType } from "react";
import type { PermissionKey } from "@repo/shared/constants";
import type { AuthUserRole } from "@repo/shared";

export type NotificationBadgeKey =
  | "contactSubmissions"
  | "warranties"
  | "warrantyClaims";

export interface BrandConfig {
  name: string;
  description: string;
  logo: ComponentType<{ className?: string }>;
}

export interface NavigationItem {
  title: string;
  href?: string;
  children?: NavigationItem[];
  activeHrefs?: string[];
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  notificationBadgeKey?: NotificationBadgeKey;
  requiredPermission?: PermissionKey;
  permissionHrefs?: Array<{ permission: PermissionKey; href: string }>;
  requiredAnyPermissions?: PermissionKey[];
  requiredRole?: Exclude<AuthUserRole, null>;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export interface TopNavigationItem {
  title: string;
  href: string;
  requiredPermission?: PermissionKey;
  permissionHrefs?: Array<{ permission: PermissionKey; href: string }>;
  requiredAnyPermissions?: PermissionKey[];
  requiredRole?: Exclude<AuthUserRole, null>;
}

export interface UserMenuItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isDestructive?: boolean;
}

export interface UserMenuConfig {
  menuItems: UserMenuItem[];
}

export interface DashboardConfig {
  brand: BrandConfig;
  sidebarSections: NavigationSection[];
  topNavigation: TopNavigationItem[];
  userMenu: UserMenuConfig;
}
