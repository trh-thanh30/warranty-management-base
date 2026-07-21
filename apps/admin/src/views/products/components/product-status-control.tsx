"use client";

import { useTranslations } from "next-intl";
import type { ProductStatus } from "@repo/shared";
import { Label, Switch } from "@repo/ui";
import { toProductActiveStatus } from "../products.utils";

export type ProductEditableStatus = Extract<
  ProductStatus,
  "ACTIVE" | "INACTIVE"
>;

type ProductStatusControlProps = {
  disabled?: boolean;
  id: string;
  onStatusChange: (status: ProductEditableStatus) => void;
  status: ProductEditableStatus;
};

export function ProductStatusControl({
  disabled,
  id,
  onStatusChange,
  status,
}: ProductStatusControlProps) {
  const t = useTranslations("Products");

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="min-w-0">
        <Label htmlFor={id}>{t(`statuses.${status}`)}</Label>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            status === "ACTIVE"
              ? "activeStatusDescription"
              : "inactiveStatusDescription",
          )}
        </p>
      </div>
      <Switch
        aria-label={t("productStatus")}
        checked={status === "ACTIVE"}
        className="shrink-0"
        disabled={disabled}
        id={id}
        onCheckedChange={(checked) =>
          onStatusChange(toProductActiveStatus(checked))
        }
      />
    </div>
  );
}
