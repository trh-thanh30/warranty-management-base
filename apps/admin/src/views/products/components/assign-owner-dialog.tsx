"use client";

import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
} from "@repo/ui";
import { useAssignProductOwnerWorkflow } from "../hooks/use-assign-product-owner";

type AssignOwnerDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
};

export function AssignOwnerDialog({
  onOpenChange,
  open,
  product,
}: AssignOwnerDialogProps) {
  const t = useTranslations("Products");
  const workflow = useAssignProductOwnerWorkflow({
    enabled: open,
    product,
    onAssigned: () => onOpenChange(false),
  });
  const customers = workflow.customersQuery.data?.items ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">
          {t("assignOwnerTitle")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("assignOwnerDescription", { name: product?.name ?? "" })}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assign-owner-search">{t("customerSearch")}</Label>
            <Input
              id="assign-owner-search"
              onChange={(event) => workflow.setSearch(event.target.value)}
              placeholder={t("customerSearchPlaceholder")}
              value={workflow.search}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-owner-customer">{t("customer")}</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
              id="assign-owner-customer"
              onChange={(event) => workflow.setCustomerId(event.target.value)}
              value={workflow.customerId}
            >
              <option value="">{t("selectCustomer")}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName} · {customer.customerCode}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assign-owner-purchase-date">
                {t("purchaseDate")}
              </Label>
              <Input
                id="assign-owner-purchase-date"
                onChange={(event) =>
                  workflow.setPurchaseDate(event.target.value)
                }
                type="date"
                value={workflow.purchaseDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-owner-activated-at">
                {t("activatedAt")}
              </Label>
              <Input
                id="assign-owner-activated-at"
                onChange={(event) =>
                  workflow.setActivatedAt(event.target.value)
                }
                type="date"
                value={workflow.activatedAt}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={workflow.isAssigning || !workflow.customerId}
            onClick={() => {
              void workflow.confirm();
            }}
            type="button"
          >
            {t("assignOwner")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
