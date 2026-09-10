"use client";

import { Link, usePathname } from "@/src/i18n/navigation";
import { isNavigationItemActive } from "@/src/utils/pathname.utils";
import { cn } from "@repo/ui/lib/utils";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

type HeaderNavLinkProps = {
  children: ReactNode;
  external?: boolean;
  href: string;
  isMobile?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function HeaderNavLink({
  href,
  children,
  external = false,
  isMobile = false,
  onClick,
}: HeaderNavLinkProps) {
  const pathname = usePathname();
  const isActive = !external && isNavigationItemActive(pathname, href);
  const className = cn(
    "text-base font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red",
    isMobile
      ? "block rounded-md px-3 py-2.5 focus-visible:ring-offset-2"
      : "relative inline-flex py-1.5 focus-visible:ring-offset-4",
    isActive
      ? isMobile
        ? "bg-premium-red/10 text-premium-red"
        : "text-premium-red after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-premium-red"
      : "text-deep-black hover:text-premium-red",
  );

  if (external) {
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={className}
      data-active={isActive ? "true" : undefined}
      href={href as Extract<ComponentProps<typeof Link>["href"], string>}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
