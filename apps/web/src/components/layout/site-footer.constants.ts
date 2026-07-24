import { APP_ROUTES } from "@/src/constants/routes.constants";

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
