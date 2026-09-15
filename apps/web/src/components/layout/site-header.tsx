"use client";

import { Container } from "@/src/components/common/container";
import { HeaderNavLink } from "@/src/components/layout/components/header-nav-link";
import { LanguageSwitcher } from "@/src/components/layout/components/language-switcher";
import { SiteLogo } from "@/src/components/layout/components/site-logo";
import {
  PUBLIC_DEALER_NETWORK_URL,
  PUBLIC_FEATURES,
  PUBLIC_PRODUCT_CATALOG_URL,
} from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const navigationItems = [
  ...(PUBLIC_FEATURES.pages.about
    ? [{ labelKey: "about" as const, href: APP_ROUTES.home, external: false }]
    : []),
  { labelKey: "warranty", href: APP_ROUTES.warranty, external: false },
  {
    labelKey: "products",
    href: PUBLIC_PRODUCT_CATALOG_URL,
    external: true,
  },
  {
    labelKey: "dealers",
    href: PUBLIC_DEALER_NETWORK_URL,
    external: true,
  },
  ...(PUBLIC_FEATURES.navigation.contact
    ? [
        {
          labelKey: "contact" as const,
          href: APP_ROUTES.contact,
          external: false,
        },
      ]
    : []),
] as const;

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  const t = useTranslations("SiteHeader");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  return (
    <header
      data-site-header
      className="sticky top-0 z-50 w-full border-b border-border-gray bg-off-white py-3 shadow-sm"
    >
      <Container className="flex items-center justify-between gap-6">
        <Link
          href={APP_ROUTES.warranty}
          aria-label={t("homeAriaLabel")}
          className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-4"
          onClick={closeMobileMenu}
        >
          <SiteLogo
            src={logoUrl}
            alt={t("logoAlt")}
            width={260}
            height={70}
            className="h-12 w-auto max-w-70 object-contain sm:h-14 md:h-15"
            priority
          />
        </Link>

        <nav aria-label={t("desktopNavLabel")} className="hidden xl:block">
          <ul className="flex list-none items-center gap-7 lg:gap-9">
            {navigationItems.map((item) => (
              <li key={item.labelKey}>
                <HeaderNavLink external={item.external} href={item.href}>
                  {t(`nav.${item.labelKey}`)}
                </HeaderNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <a
            href={PUBLIC_DEALER_NETWORK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-premium-red px-7 py-3 text-xs font-medium uppercase tracking-wide text-off-white shadow-md shadow-premium-red/20 transition-colors duration-200 hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 sm:text-sm"
          >
            {t("dealerCta")}
          </a>
          <LanguageSwitcher />
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
      </Container>

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
              {navigationItems.map((item) => (
                <li key={item.labelKey}>
                  <HeaderNavLink
                    external={item.external}
                    href={item.href}
                    isMobile
                    onClick={closeMobileMenu}
                  >
                    {t(`nav.${item.labelKey}`)}
                  </HeaderNavLink>
                </li>
              ))}
              <li className="pt-3">
                <a
                  href={PUBLIC_DEALER_NETWORK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="block rounded-md bg-premium-red py-3.5 text-center text-sm font-medium uppercase tracking-wide text-off-white shadow-md shadow-premium-red/20 transition-colors duration-200 hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
                >
                  {t("dealerCta")}
                </a>
              </li>
              <li>
                <LanguageSwitcher
                  className="w-full"
                  onNavigate={closeMobileMenu}
                />
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
