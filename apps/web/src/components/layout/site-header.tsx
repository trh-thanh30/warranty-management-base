"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link, usePathname } from "@/src/i18n/navigation";

const navigationItems = [
  { labelKey: "home", href: APP_ROUTES.home },
  { labelKey: "about", href: APP_ROUTES.about },
  { labelKey: "products", href: APP_ROUTES.products },
  { labelKey: "warranty", href: APP_ROUTES.warranty },
  {
    labelKey: "dealers",
    href: APP_ROUTES.dealers,
  },
  { labelKey: "contact", href: APP_ROUTES.contact },
] as const;

const navigationLinkBaseClassName =
  "relative inline-flex py-1.5 text-base font-medium uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-4";

const navigationLinkInactiveClassName =
  "text-deep-black hover:text-premium-red";

const navigationLinkActiveClassName =
  "text-premium-red after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-premium-red";

const mobileNavigationLinkBaseClassName =
  "block rounded-md px-3 py-2.5 text-base font-medium uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2";

const mobileNavigationLinkInactiveClassName =
  "text-deep-black hover:text-premium-red";

const mobileNavigationLinkActiveClassName =
  "bg-premium-red/10 text-premium-red";

const normalizePathname = (pathname: string) => {
  const withoutLocale = pathname.replace(/^\/(?:vi|en)(?=\/|$)/, "") || "/";
  return withoutLocale.length > 1
    ? withoutLocale.replace(/\/$/, "")
    : withoutLocale;
};

const isNavigationItemActive = (pathname: string, activePath: string) => {
  const normalizedPathname = normalizePathname(pathname);

  return activePath === "/"
    ? normalizedPathname === "/"
    : normalizedPathname === activePath ||
        normalizedPathname.startsWith(`${activePath}/`);
};

export function SiteHeader() {
  const t = useTranslations("SiteHeader");
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isDealerRouteActive =
    isNavigationItemActive(pathname, APP_ROUTES.dealers) ||
    isNavigationItemActive(pathname, APP_ROUTES.supportCenters);

  return (
    <header
      data-site-header
      className="fixed inset-x-0 top-0 z-50 w-full border-b border-border-gray bg-off-white py-3 shadow-sm"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 sm:px-8">
        <Link
          href={APP_ROUTES.home}
          aria-label={t("homeAriaLabel")}
          className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-4"
          onClick={closeMobileMenu}
        >
          <Image
            src="/logo.png"
            alt={t("logoAlt")}
            width={260}
            height={70}
            className="h-12 w-auto max-w-[280px] object-contain sm:h-14 md:h-[60px]"
            priority
          />
        </Link>

        <nav aria-label={t("desktopNavLabel")} className="hidden xl:block">
          <ul className="flex list-none items-center gap-7 lg:gap-9">
            {navigationItems.map((item) => {
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    data-active={isActive ? "true" : undefined}
                    className={`${navigationLinkBaseClassName} ${
                      isActive
                        ? navigationLinkActiveClassName
                        : navigationLinkInactiveClassName
                    }`}
                  >
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <Link
            href={APP_ROUTES.dealers}
            aria-current={isDealerRouteActive ? "page" : undefined}
            data-active={isDealerRouteActive ? "true" : undefined}
            className="rounded-[14px] bg-premium-red px-7 py-3 text-xs font-medium uppercase tracking-wide text-off-white shadow-md shadow-premium-red/20 transition-colors duration-200 hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 sm:text-sm"
          >
            {t("dealerCta")}
          </Link>
        </div>

        <button
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={
            isMobileMenuOpen ? t("closeMenuAriaLabel") : t("openMenuAriaLabel")
          }
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-deep-black transition-colors duration-200 hover:bg-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 xl:hidden"
        >
          <span className="relative flex size-6 items-center justify-center">
            <Menu
              aria-hidden="true"
              className={`absolute size-6 transition-all duration-200 ${isMobileMenuOpen ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
            />
            <X
              aria-hidden="true"
              className={`absolute size-6 transition-all duration-200 ${isMobileMenuOpen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label={t("mobileNavLabel")}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={
              shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
            }
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="max-h-[calc(100vh-70px)] overflow-y-auto border-t border-border-gray bg-off-white shadow-xl xl:hidden"
          >
            <ul className="space-y-2 px-6 py-5">
              {navigationItems.map((item) => {
                const isActive = isNavigationItemActive(pathname, item.href);

                return (
                  <li key={item.labelKey}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      data-active={isActive ? "true" : undefined}
                      onClick={closeMobileMenu}
                      className={`${mobileNavigationLinkBaseClassName} ${
                        isActive
                          ? mobileNavigationLinkActiveClassName
                          : mobileNavigationLinkInactiveClassName
                      }`}
                    >
                      {t(`nav.${item.labelKey}`)}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-3">
                <Link
                  href={APP_ROUTES.dealers}
                  aria-current={isDealerRouteActive ? "page" : undefined}
                  data-active={isDealerRouteActive ? "true" : undefined}
                  onClick={closeMobileMenu}
                  className="block rounded-[14px] bg-premium-red py-3.5 text-center text-sm font-medium uppercase tracking-wide text-off-white shadow-md shadow-premium-red/20 transition-colors duration-200 hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
                >
                  {t("dealerCta")}
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
