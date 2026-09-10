"use client";

import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function WarrantyPolicyShortcut() {
  const t = useTranslations("Warranty.lookup.policyShortcut");

  return (
    <section className="mx-auto">
      <div className="flex flex-col items-center justify-between gap-6 border-t border-border-gray pt-6 sm:flex-row">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-premium-red">
            <ShieldCheck className="size-4" />
            <span>{t("eyebrow")}</span>
          </div>
          <h3 className="text-lg font-semibold uppercase text-deep-black sm:text-xl">
            {t("title")}
          </h3>
          <p className="text-sm font-medium text-stone-gray">
            {t("description")}
          </p>
        </div>

        <Link
          href={APP_ROUTES.policyWarrantyReturn}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-md bg-premium-red px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-warm-red"
        >
          <span>{t("action")}</span>
          <FileText className="size-4" />
        </Link>
      </div>
    </section>
  );
}
