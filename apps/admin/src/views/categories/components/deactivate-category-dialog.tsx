"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";

type DeactivateCategoryDialogProps = {
  category: CategoryResponse | null;
  isDeactivating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeactivateCategoryDialog({
  category,
  isDeactivating,
  onConfirm,
  onOpenChange,
  open,
}: DeactivateCategoryDialogProps) {
  const t = useTranslations("Categories");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">
          {t("deactivateTitle")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("deactivateDescription", {
            name: category?.name ?? "",
          })}
        </DialogDescription>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button disabled={isDeactivating} type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={isDeactivating || !category}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isDeactivating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {t("deactivate")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
