"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DraftActivationField } from "../category-activation-fields.types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { CategoryActivationFieldsPreview } from "./category-activation-fields-preview";

type CategoryActivationFieldsPreviewDialogProps = {
  fields: DraftActivationField[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CategoryActivationFieldsPreviewDialog({
  fields,
  onOpenChange,
  open,
}: CategoryActivationFieldsPreviewDialogProps) {
  const t = useTranslations("Categories");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[56rem] flex-col gap-0 overflow-hidden rounded-lg p-4 ease-out data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 motion-reduce:animate-none sm:rounded-lg sm:p-4 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:rounded-none max-sm:p-0">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:border-0 sm:bg-transparent sm:p-0 sm:dark:border-0 sm:dark:bg-transparent">
          <DialogClose asChild>
            <Button
              aria-label={t("closePreview")}
              className="absolute right-4 top-4 z-10"
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="pr-12 text-lg font-semibold">
            {t("activationFieldsPreviewTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 pr-10 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("activationFieldsPreviewDescription")}
          </DialogDescription>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:max-h-[calc(100dvh-12rem)] sm:px-0 sm:py-0 sm:pt-5 max-sm:flex-1">
          <CategoryActivationFieldsPreview fields={fields} />
        </div>

        <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-5 sm:dark:border-0 sm:dark:bg-transparent">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("closePreview")}
            </Button>
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
