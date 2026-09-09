"use client";

import { useToast } from "@/src/hooks/use-toast";
import { CustomerForm } from "../../customers/components/customer-form";
import type { CustomerFormValues } from "../../customers/customers.types";
import type { CustomerSummary } from "@repo/shared";
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
} from "@repo/ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type EditActivationRequestCustomerDialogProps = {
  canUpdateCustomerProfile: boolean;
  customer: CustomerSummary | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (values: CustomerFormValues, updateCustomerProfile: boolean) => void;
  open: boolean;
  updateCustomerProfile: boolean;
};

export function EditActivationRequestCustomerDialog({
  canUpdateCustomerProfile,
  customer,
  onOpenChange,
  onSaved,
  open,
  updateCustomerProfile,
}: EditActivationRequestCustomerDialogProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const toast = useToast();
  const [shouldUpdateCustomerProfile, setShouldUpdateCustomerProfile] =
    useState(false);

  useEffect(() => {
    if (!open) return;
    setShouldUpdateCustomerProfile(
      canUpdateCustomerProfile && updateCustomerProfile,
    );
  }, [canUpdateCustomerProfile, open, updateCustomerProfile]);

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
            {t("editCustomerTitle")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("editCustomerDescription")}
          </DialogDescription>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:overflow-visible sm:p-0">
          <CustomerForm
            customer={customer}
            embedded
            onCancel={() => onOpenChange(false)}
            onSaved={() => undefined}
            onSubmitValues={(values) => {
              const shouldSyncCustomerProfile =
                canUpdateCustomerProfile && shouldUpdateCustomerProfile;

              onSaved(values, shouldSyncCustomerProfile);
              toast.success(
                shouldSyncCustomerProfile
                  ? t("customerProfileSyncSelected")
                  : t("customerSnapshotApplied"),
              );
              onOpenChange(false);
            }}
            options={
              canUpdateCustomerProfile ? (
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <Checkbox
                    checked={shouldUpdateCustomerProfile}
                    id="activation-request-update-customer-profile"
                    onCheckedChange={(checked) =>
                      setShouldUpdateCustomerProfile(checked === true)
                    }
                  />
                  <div className="min-w-0">
                    <Label
                      className="cursor-pointer font-medium"
                      htmlFor="activation-request-update-customer-profile"
                    >
                      {t("updateCustomerProfile")}
                    </Label>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {shouldUpdateCustomerProfile
                        ? t("updateCustomerProfileDescription")
                        : t("customerSnapshotOnlyDescription")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
                  {t("customerSnapshotOnlyDescription")}
                </p>
              )
            }
            submitLabel={t("applyCustomerChanges")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
