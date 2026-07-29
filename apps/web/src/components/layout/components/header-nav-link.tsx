"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Link, usePathname } from "@/src/i18n/navigation";
import { isNavigationItemActive } from "@/src/utils/pathname.utils";

type HeaderNavLinkProps = {
  href: Extract<ComponentProps<typeof Link>["href"], string>;
  children: ReactNode;
  isMobile?: boolean;
  onClick?: ComponentProps<typeof Link>["onClick"];
};

export function HeaderNavLink({
  href,
  children,
  isMobile = false,
  onClick,
}: HeaderNavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavigationItemActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "text-base font-medium uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red",
        isMobile
          ? "block rounded-md px-3 py-2.5 focus-visible:ring-offset-2"
          : "relative inline-flex py-1.5 focus-visible:ring-offset-4",
        isActive
          ? isMobile
            ? "bg-premium-red/10 text-premium-red"
            : "text-premium-red after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-premium-red"
          : "text-deep-black hover:text-premium-red",
      )}
    >
      {children}
    </Link>
  );
}
