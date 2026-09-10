"use client";

import type { ProductResponse } from "@repo/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { AssignActivationCodesForm } from "./assign-activation-codes-form";

export function AssignActivationCodesDialog({
  onAssigned,
  onOpenChange,
  open,
  product,
}: {
  onAssigned?: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
}) {
  const t = useTranslations("ProductActivationCodeAssignment");
  const productName = product?.displayName || product?.name || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),58rem)] overflow-y-auto sm:min-h-[min(42rem,calc(100dvh-2rem))] md:max-w-4xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description", { product: productName })}
        </DialogDescription>
        <AssignActivationCodesForm
          active={open}
          onAssigned={async () => {
            await onAssigned?.();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          product={product}
        />
      </DialogContent>
    </Dialog>
  );
}
