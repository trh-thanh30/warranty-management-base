import type { ContentPageKind } from "@repo/shared";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import type { PolicyKey, PolicyLocale } from "./policy.types";

type PolicyConfigShape = {
  href: (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
  key: PolicyKey;
  kind: ContentPageKind;
  slugs: Record<PolicyLocale, string>;
};

export const POLICY_CONFIGS = [
  {
    href: APP_ROUTES.policyGeneral,
    key: "general",
    kind: "GENERAL_POLICY",
    slugs: {
      en: "policies-general",
      vi: "chinh-sach-quy-dinh-chung",
    },
  },
  {
    href: APP_ROUTES.policyPrivacy,
    key: "privacy",
    kind: "PRIVACY_POLICY",
    slugs: {
      en: "policies-privacy",
      vi: "chinh-sach-bao-mat",
    },
  },
  {
    href: APP_ROUTES.policyPurchasing,
    key: "purchasing",
    kind: "PURCHASE_POLICY",
    slugs: {
      en: "policies-purchasing",
      vi: "chinh-sach-mua-hang",
    },
  },
  {
    href: APP_ROUTES.policyWarrantyReturn,
    key: "warrantyReturn",
    kind: "WARRANTY_RETURN_POLICY",
    slugs: {
      en: "policies-warranty-return",
      vi: "chinh-sach-bao-hanh-doi-tra",
    },
  },
  {
    href: APP_ROUTES.policyShipping,
    key: "shipping",
    kind: "SHIPPING_POLICY",
    slugs: {
      en: "policies-shipping",
      vi: "chinh-sach-giao-hang",
    },
  },
  {
    href: APP_ROUTES.policyPayment,
    key: "payment",
    kind: "PAYMENT_POLICY",
    slugs: {
      en: "policies-payment",
      vi: "chinh-sach-thanh-toan",
    },
  },
] as const satisfies readonly PolicyConfigShape[];

export function getPolicyConfig(key: PolicyKey) {
  return (
    POLICY_CONFIGS.find((config) => config.key === key) ?? POLICY_CONFIGS[0]!
  );
}

export function toPolicyLocale(locale: string): PolicyLocale {
  return locale === "en" ? "en" : "vi";
}
