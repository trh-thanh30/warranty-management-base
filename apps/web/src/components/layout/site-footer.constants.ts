import { APP_ROUTES } from "@/src/constants/routes.constants";
import { FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

export const footerLogo = {
  src: "/logo_2.png",
  width: 240,
} as const;

export const footerNavigationItems = [
  { id: "about", href: APP_ROUTES.about },
  { id: "products", href: APP_ROUTES.products },
  { id: "warranty", href: APP_ROUTES.warranty },
  { id: "dealers", href: APP_ROUTES.dealers },
  { id: "contact", href: APP_ROUTES.contact },
] as const;

export const footerPolicyItems = [
  { id: "general", href: APP_ROUTES.policyGeneral },
  { id: "privacy", href: APP_ROUTES.policyPrivacy },
  { id: "purchasing", href: APP_ROUTES.policyPurchasing },
  { id: "warrantyReturn", href: APP_ROUTES.policyWarrantyReturn },
  { id: "shipping", href: APP_ROUTES.policyShipping },
  { id: "payment", href: APP_ROUTES.policyPayment },
] as const;

export const footerHotlineItems = [
  {
    id: "hcm",
    labelKey: "hcm",
    href: "tel:0886337733",
    displayValue: "0886 33 77 33",
  },
  {
    id: "hanoi",
    labelKey: "hanoi",
    href: "tel:0989017999",
    displayValue: "0989 017 999",
  },
] as const;

export const footerContactEmail = {
  href: "mailto:fujitek.lexzenz.vn@gmail.com",
  displayValue: "fujitek.lexzenz.vn@gmail.com",
} as const;

export const footerSocialItems = [
  {
    id: "facebook",
    href: "#",
    label: "Facebook",
    icon: FaFacebookF,
    className: "bg-facebook-blue",
    iconClassName: "size-4",
  },
  {
    id: "zalo",
    href: "#",
    label: "Zalo",
    icon: SiZalo,
    className: "bg-zalo-blue",
    iconClassName: "size-5",
  },
  {
    id: "tiktok",
    href: "#",
    label: "TikTok",
    icon: FaTiktok,
    className: "bg-black",
    iconClassName: "size-5",
  },
  {
    id: "youtube",
    href: "#",
    label: "YouTube",
    icon: FaYoutube,
    className: "bg-danger-red",
    iconClassName: "size-5",
  },
] as const;
