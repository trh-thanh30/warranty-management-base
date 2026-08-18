"use client";

import type { CustomerSummary } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CustomerForm } from "./customer-form";

type CreateCustomerDialogProps = {
  onOpenChange: (open: boolean) => void;
  onSaved: (customer: CustomerSummary) => void;
  open: boolean;
};

export function CreateCustomerDialog({
  onOpenChange,
  onSaved,
  open,
}: CreateCustomerDialogProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex h-dvh max-h-dvh w-screen max-w-none flex-col overflow-hidden rounded-none p-0 sm:block sm:h-fit sm:max-h-[calc(100dvh-2rem)] sm:w-[min(calc(100vw-2rem),56rem)] sm:overflow-y-auto sm:rounded-lg sm:p-6">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950 sm:mb-5 sm:border-0 sm:bg-transparent sm:p-0">
          <DialogClose asChild>
            <Button
              aria-label={t("cancel")}
              className="absolute right-4 top-4 z-10 sm:hidden"
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="pr-12 text-lg font-semibold sm:pr-0">
            {t("createNewCustomer")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-500">
            {t("newCustomerDescription")}
          </DialogDescription>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:overflow-visible sm:p-0">
          <CustomerForm
            embedded
            customer={null}
            onCancel={() => onOpenChange(false)}
            onSaved={(customer) => {
              if (customer) onSaved(customer);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
