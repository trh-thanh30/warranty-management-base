"use client";

import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { cn } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

type WarrantyBackLinkProps = {
  className?: string;
  inverse?: boolean;
};

export function WarrantyBackLink({
  className,
  inverse = false,
}: WarrantyBackLinkProps) {
  const t = useTranslations("Warranty");

  return (
    <Link
      className={cn(
        "inline-flex w-fit items-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        inverse
          ? "text-white/80 hover:text-white focus-visible:ring-white"
          : "text-stone-gray hover:text-premium-red focus-visible:ring-premium-red",
        className,
      )}
      href={APP_ROUTES.warranty}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t("backToWarranty")}
    </Link>
  );
}
