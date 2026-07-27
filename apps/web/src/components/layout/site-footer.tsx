"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/src/i18n/navigation";
import { ArrowUp } from "lucide-react";
import { FooterSocialLink } from "@/src/components/layout/components/footer-social-link";
import {
  footerContactEmail,
  footerHotlineItems,
  footerLogo,
  footerNavigationItems,
  footerPolicyItems,
  footerSocialItems,
} from "./site-footer.constants";

export function SiteFooter() {
  const t = useTranslations("HomePage.footer");
  const [isVisible, setIsVisible] = useState(false);

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
        className="w-full scroll-mt-[84px] bg-gray-50 text-deep-black"
      >
        {/* Main Footer Container */}
        <Container className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Column 1: Logo & Company Address */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative h-14 w-[240px]">
                <Image
                  src={footerLogo.src}
                  alt={t("logoAlt")}
                  fill
                  priority
                  sizes={`${footerLogo.width}px`}
                  className="object-contain object-left"
                />
              </div>

              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider pt-2">
                {t("companyName")}
              </h4>

              <div className="space-y-3 text-sm sm:text-base text-dark-charcoal font-medium leading-relaxed">
                <div>
                  <span className="block font-medium text-deep-black uppercase">
                    {t("offices.hcm.label")}
                  </span>
                  <span>{t("offices.hcm.address")}</span>
                </div>

                <div>
                  <span className="block font-medium text-deep-black uppercase">
                    {t("offices.hanoi.label")}
                  </span>
                  <span>{t("offices.hanoi.address")}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider">
                {t("navigationTitle")}
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-base font-medium text-medium-gray">
                {footerNavigationItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="hover:text-premium-red transition-colors"
                    >
                      {t(`navigation.${item.id}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Policy Links */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-base font-semibold uppercase text-deep-black tracking-wider">
                {t("policyTitle")}
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-base font-medium text-medium-gray">
                {footerPolicyItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="hover:text-premium-red transition-colors"
                    >
                      {t(`policy.${item.id}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Hotline & Socials */}
            <div className="lg:col-span-2 space-y-4">
              {footerHotlineItems.map((item) => (
                <div key={item.id}>
                  <span className="block text-xs sm:text-sm font-medium text-stone-gray uppercase">
                    {t(`hotlines.${item.labelKey}`)}
                  </span>
                  <a
                    href={item.href}
                    className="text-xl sm:text-2xl font-semibold text-premium-red hover:underline block"
                  >
                    {item.displayValue}
                  </a>
                </div>
              ))}

              <a
                href={footerContactEmail.href}
                className="block break-all pt-1 text-xs font-medium text-medium-gray sm:text-sm"
              >
                {footerContactEmail.displayValue}
              </a>

              <div className="flex items-center gap-2 pt-1 text-sm font-semibold uppercase text-premium-red sm:text-base">
                <svg
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
                {footerSocialItems.map((item) => (
                  <FooterSocialLink
                    key={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    className={item.className}
                    iconClassName={item.iconClassName}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>

        {/* Bottom Copyright Bar */}
        <div className="w-full border-t-2 border-t-premium-red bg-gray-100 py-4">
          <Container className="text-center text-xs sm:text-sm text-deep-black font-base">
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
            className="group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-premium-red text-white shadow-xl border border-white/20 transition-all duration-300 cursor-pointer hover:bg-warm-red"
            aria-label={t("backToTopAriaLabel")}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
