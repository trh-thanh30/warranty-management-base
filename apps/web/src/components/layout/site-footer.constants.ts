import {
  PUBLIC_FEATURES,
  PUBLIC_DEALER_NETWORK_URL,
  PUBLIC_PRODUCT_CATALOG_URL,
} from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

export const footerNavigationItems = [
  ...(PUBLIC_FEATURES.pages.about
    ? [{ id: "about" as const, href: APP_ROUTES.home, external: false }]
    : []),
  {
    id: "products",
    href: PUBLIC_PRODUCT_CATALOG_URL,
    external: true,
  },
  { id: "warranty", href: APP_ROUTES.warranty, external: false },
  { id: "dealers", href: PUBLIC_DEALER_NETWORK_URL, external: true },
  ...(PUBLIC_FEATURES.navigation.contact
    ? [{ id: "contact" as const, href: APP_ROUTES.contact, external: false }]
    : []),
] as const;

export const footerPolicyItems = [
  { id: "general", href: APP_ROUTES.policyGeneral },
  { id: "privacy", href: APP_ROUTES.policyPrivacy },
  { id: "purchasing", href: APP_ROUTES.policyPurchasing },
  { id: "warrantyReturn", href: APP_ROUTES.policyWarrantyReturn },
  { id: "shipping", href: APP_ROUTES.policyShipping },
  { id: "payment", href: APP_ROUTES.policyPayment },
] as const;

export const footerSocialItems = [
  {
    id: "facebook",
    label: "Facebook",
    platform: "FACEBOOK",
    icon: FaFacebookF,
    className:
      "bg-facebook-blue text-white focus-visible:bg-facebook-blue focus-visible:text-white",
    iconClassName: "size-4",
  },
  {
    id: "zalo",
    label: "Zalo",
    platform: "ZALO",
    icon: SiZalo,
    className:
      "bg-zalo-blue text-white focus-visible:bg-zalo-blue focus-visible:text-white",
    iconClassName: "size-5",
  },
  {
    id: "tiktok",
    label: "TikTok",
    platform: "TIKTOK",
    icon: FaTiktok,
    className:
      "border-white/40 bg-black text-white focus-visible:bg-black focus-visible:text-white",
    iconClassName: "size-5",
  },
  {
    id: "youtube",
    label: "YouTube",
    platform: "YOUTUBE",
    icon: FaYoutube,
    className:
      "bg-danger-red text-white focus-visible:bg-danger-red focus-visible:text-white",
    iconClassName: "size-5",
  },
] as const;
