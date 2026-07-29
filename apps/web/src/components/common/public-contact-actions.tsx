import type { PublicWebsiteSiteSetting } from "@repo/shared";
import { motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaFacebookF } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { cn } from "@repo/ui/lib/utils";
import { toTelephoneHref } from "@/src/utils/link.utils";

type PublicContactActionsProps = {
  isVisible: boolean;
  siteSettings?: PublicWebsiteSiteSetting | null;
};

export function PublicContactActions({
  isVisible,
  siteSettings,
}: PublicContactActionsProps) {
  const t = useTranslations("QuickContact");
  const shouldReduceMotion = useReducedMotion();
  const phone = [...(siteSettings?.offices ?? [])]
    .filter((office) => office.isActive && office.phone?.trim())
    .sort((left, right) => left.sortOrder - right.sortOrder)[0]
    ?.phone?.trim();
  const zaloUrl = findActiveSocialUrl(siteSettings, "ZALO");
  const facebookUrl = findActiveSocialUrl(siteSettings, "FACEBOOK");

  const actions = [
    zaloUrl
      ? {
          ariaLabel: t("zalo"),
          className: "bg-zalo-blue",
          href: zaloUrl,
          icon: SiZalo,
          label: "Zalo",
          target: "_blank",
        }
      : null,
    phone
      ? {
          ariaLabel: t("phone", { phone }),
          className: "bg-premium-red",
          href: `tel:${toTelephoneHref(phone)}`,
          icon: Phone,
          label: phone,
          target: undefined,
        }
      : null,
    facebookUrl
      ? {
          ariaLabel: t("facebook"),
          className: "bg-facebook-blue",
          href: facebookUrl,
          icon: FaFacebookF,
          label: "Facebook",
          target: "_blank",
        }
      : null,
  ].filter((action) => action !== null);

  if (actions.length === 0) return null;

  return (
    <nav
      aria-label={t("navigationLabel")}
      aria-hidden={!isVisible}
      className="fixed bottom-6 right-20 z-[60] flex flex-row-reverse gap-2"
      inert={!isVisible}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <motion.a
            animate={
              isVisible
                ? { opacity: 1, scale: 1, x: 0 }
                : {
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.75,
                    x: shouldReduceMotion ? 0 : 12,
                  }
            }
            aria-label={action.ariaLabel}
            className={cn(
              "group relative flex size-12 items-center justify-center rounded-full border border-white/30 text-white shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2",
              !isVisible && "pointer-events-none",
              action.className,
            )}
            href={action.href}
            initial={false}
            key={action.ariaLabel}
            rel={action.target ? "noopener noreferrer" : undefined}
            target={action.target}
            title={action.ariaLabel}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    delay: isVisible ? index * 0.04 : 0,
                    duration: isVisible ? 0.22 : 0.15,
                    ease: "easeOut",
                  }
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-full mb-3 hidden whitespace-nowrap rounded-md bg-deep-black px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
              {action.label}
            </span>
          </motion.a>
        );
      })}
    </nav>
  );
}

function findActiveSocialUrl(
  siteSettings: PublicWebsiteSiteSetting | null | undefined,
  platform: "FACEBOOK" | "ZALO",
) {
  return siteSettings?.socialLinks.find(
    (social) =>
      social.isActive &&
      social.platform === platform &&
      social.url.startsWith("https://"),
  )?.url;
}
