import type { ComponentType } from "react";

export interface BrandConfig {
  name: string;
  description: string;
  logo: ComponentType<{ className?: string }>;
}

export interface NavigationItem {
  title: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export interface TopNavigationItem {
  title: string;
  href: string;
}

export interface UserMenuItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isDestructive?: boolean;
}

export interface UserMenuConfig {
  name: string;
  email: string;
  avatarFallback: string;
  avatarUrl?: string;
  menuItems: UserMenuItem[];
}

export interface DashboardConfig {
  brand: BrandConfig;
  sidebarSections: NavigationSection[];
  topNavigation: TopNavigationItem[];
  userMenu: UserMenuConfig;
}
