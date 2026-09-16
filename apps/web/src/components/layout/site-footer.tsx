"use client";

import { Container } from "@/src/components/common/container";
import { FooterSocialLink } from "@/src/components/layout/components/footer-social-link";
import { SiteLogo } from "@/src/components/layout/components/site-logo";
import { Link, usePathname } from "@/src/i18n/navigation";
import {
  displayWebsite,
  normalizeExternalUrl,
  toTelephoneHref,
} from "@/src/utils/link.utils";
import { isNavigationItemActive } from "@/src/utils/pathname.utils";
import type { PublicWebsiteSiteSetting } from "@repo/shared";
import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  footerNavigationItems,
  footerPolicyItems,
  footerSocialItems,
} from "./site-footer.constants";

export function SiteFooter({
  siteSettings,
}: {
  siteSettings?: PublicWebsiteSiteSetting | null;
}) {
  const t = useTranslations("HomePage.footer");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const offices = [...(siteSettings?.offices ?? [])]
    .filter((office) => office.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const socialLinks = siteSettings?.socialLinks ?? [];
  const contactEmail = siteSettings?.contactEmail.trim();
  const websiteHref = normalizeExternalUrl(siteSettings?.websiteUrl);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {/* ── Footer ── */}
      <footer
        id="contact"
        className="w-full scroll-mt-21 bg-white text-deep-black border-t border-t-premium-red"
      >
        {/* Main Footer Container */}
        <Container className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-11 items-start">
            {/* Column 1: Logo & Company Address */}
            <div className="lg:col-span-4 space-y-4">
              <div className="h-14 w-60">
                <SiteLogo
                  src={siteSettings?.footerLogo?.url}
                  alt={t("logoAlt")}
                  width={240}
                  height={56}
                  className="h-14 w-auto max-w-60 object-contain object-left"
                />
              </div>

              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider pt-2">
                {t("companyName")}
              </h4>

              {offices.length > 0 && (
                <div className="space-y-3 text-sm sm:text-base text-dark-charcoal font-medium leading-relaxed">
                  {offices.map((office) => (
                    <div key={office.id}>
                      <span className="block font-medium text-deep-black uppercase">
                        {office.label}
                      </span>
                      <span>{office.address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Navigation Links */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider">
                {t("navigationTitle")}
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-base font-medium text-medium-gray">
                {footerNavigationItems.map((item) => {
                  const isActive =
                    !item.external &&
                    isNavigationItemActive(pathname, item.href);

                  return (
                    <li key={item.id}>
                      {item.external ? (
                        <a
                          className={footerLinkClassName(false)}
                          href={item.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {t(`navigation.${item.id}`)}
                        </a>
                      ) : (
                        <Link
                          aria-current={isActive ? "page" : undefined}
                          data-active={isActive ? "true" : undefined}
                          href={item.href}
                          className={footerLinkClassName(isActive)}
                        >
                          {t(`navigation.${item.id}`)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Policy Links */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider">
                {t("policyTitle")}
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-base font-medium text-medium-gray">
                {footerPolicyItems.map((item) => {
                  const isActive = isNavigationItemActive(pathname, item.href);

                  return (
                    <li key={item.id}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        data-active={isActive ? "true" : undefined}
                        href={item.href}
                        className={footerLinkClassName(isActive)}
                      >
                        {t(`policy.${item.id}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 4: Hotline & Socials */}
            <div className="lg:col-span-2 space-y-4">
              {offices
                .filter((office) => office.phone?.trim())
                .map((office) => (
                  <div key={office.id}>
                    <span className="block text-xs sm:text-sm font-medium text-stone-gray uppercase">
                      {t("hotline", { office: office.label })}
                    </span>
                    <a
                      href={`tel:${toTelephoneHref(office.phone ?? "")}`}
                      className="text-xl sm:text-2xl text-nowrap font-semibold text-premium-red hover:underline block"
                    >
                      {office.phone}
                    </a>
                  </div>
                ))}

              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="block break-all pt-1 text-xs font-medium text-medium-gray sm:text-sm hover:text-premium-red"
                >
                  {contactEmail}
                </a>
              )}

              {websiteHref && (
                <a
                  href={websiteHref}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="block break-all text-xs font-medium text-medium-gray sm:text-sm hover:text-premium-red"
                >
                  {displayWebsite(siteSettings?.websiteUrl ?? websiteHref)}
                </a>
              )}

              <div className="flex items-center gap-2 pt-1 text-sm font-semibold uppercase text-premium-red sm:text-base">
                <svg
                  data-footer-japan-flag
                  className="h-3.5 w-5 shrink-0 rounded-xs overflow-hidden border border-border-gray"
                  viewBox="0 0 900 600"
                  aria-hidden="true"
                >
                  <rect width="900" height="600" fill="#ffffff" />
                  <circle cx="450" cy="300" r="180" fill="#DB2114" />
                </svg>
                <span>{t("japan")}</span>
              </div>

              {/* Social Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                {footerSocialItems.map((item) => {
                  const configuredLink = socialLinks.find(
                    (social) =>
                      social.isActive &&
                      social.platform === item.platform &&
                      social.url.startsWith("https://"),
                  );

                  return (
                    <FooterSocialLink
                      key={item.id}
                      href={configuredLink?.url}
                      label={configuredLink?.label || item.label}
                      icon={item.icon}
                      className={item.className}
                      iconClassName={item.iconClassName}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Container>

        {/* Bottom Copyright Bar */}
        <div className="w-full border-t-2 border-t-premium-red bg-light-gray/10 py-4">
          <Container className="text-center text-xs sm:text-sm text-deep-black font-semibold">
            {t("copyright", { year: new Date().getFullYear() })}
          </Container>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-premium-red text-white shadow-xl border border-white/20 transition-all duration-300 cursor-pointer hover:bg-warm-red"
            aria-label={t("backToTopAriaLabel")}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function footerLinkClassName(isActive: boolean) {
  return cn(
    "relative inline-flex py-0.5 transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2",
    isActive
      ? "font-semibold text-premium-red after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:rounded-full after:bg-premium-red"
      : "text-medium-gray hover:text-premium-red",
  );
}
