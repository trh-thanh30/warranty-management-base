"use client";

import type { CustomerSummary } from "@repo/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
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
      <DialogContent className="max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),56rem)] overflow-y-auto p-6">
        <DialogTitle className="text-lg font-semibold">
          {t("createNewCustomer")}
        </DialogTitle>
        <DialogDescription className="mb-5 text-sm text-slate-500">
          {t("newCustomerDescription")}
        </DialogDescription>
        <CustomerForm
          embedded
          customer={null}
          onCancel={() => onOpenChange(false)}
          onSaved={(customer) => {
            if (customer) onSaved(customer);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
