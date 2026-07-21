"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CustomerSummary, ProductResponse } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DatePicker,
  Input,
  Label,
  Switch,
} from "@repo/ui";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/common/combobox";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const workflow = useAssignProductOwnerWorkflow({
    enabled: open,
    product,
    onAssigned: () => onOpenChange(false),
  });
  const customers = workflow.customersQuery.data?.items ?? [];
  const selectedCustomer = customers.find(
    (customer) => customer.id === workflow.customerId,
  );
  const currentOwnerName =
    product?.owner?.fullName ?? product?.owner?.customerCode ?? "-";

  function handleAssignClick() {
    if (
      product?.owner &&
      selectedCustomer &&
      product.owner.customerId !== selectedCustomer.id
    ) {
      setConfirmOpen(true);
      return;
    }

    void workflow.confirm();
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmOpen(false);
            workflow.reset();
          }
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
              <Label htmlFor="assign-owner-customer-search">
                {t("customerSearch")}
              </Label>
              <Combobox
                disabled={workflow.customersQuery.isLoading}
                onValueChange={workflow.setCustomerId}
                value={workflow.customerId}
              >
                <ComboboxTrigger
                  id="assign-owner-customer-search"
                  placeholder={t("customerSearchPlaceholder")}
                  selectedLabel={
                    selectedCustomer
                      ? formatCustomerOption(selectedCustomer)
                      : undefined
                  }
                />
                <ComboboxContent>
                  <ComboboxInput
                    placeholder={t("customerSearchPlaceholder")}
                    showTrigger={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noCustomerFound")}</ComboboxEmpty>
                    {customers.map((customer) => (
                      <ComboboxItem key={customer.id} value={customer.id}>
                        {formatCustomerOption(customer)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {selectedCustomer ? (
              <CustomerReadonlyCard customer={selectedCustomer} />
            ) : null}

            {product?.warranty?.status === "DRAFT" ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                {t("assignOwnerWarrantyDraftNotice")}
              </p>
            ) : null}

            {product?.warrantyCode ? (
              <div className="space-y-2">
                <Label htmlFor="assign-owner-existing-warranty-code">
                  {t("warrantyCode")}
                </Label>
                <Input
                  id="assign-owner-existing-warranty-code"
                  readOnly
                  value={product.warrantyCode}
                />
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t("existingWarrantyCodeDescription")}
                </p>
              </div>
            ) : (
              <div className="space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="assign-owner-auto-warranty-code">
                      {t("autoGenerateWarrantyCode")}
                    </Label>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {t("autoGenerateWarrantyCodeOnAssignmentDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={workflow.autoGenerateWarrantyCode}
                    className="shrink-0"
                    id="assign-owner-auto-warranty-code"
                    onCheckedChange={workflow.setAutoGenerateWarrantyCode}
                  />
                </div>
                {!workflow.autoGenerateWarrantyCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="assign-owner-warranty-code">
                      {t("warrantyCode")}
                    </Label>
                    <Input
                      id="assign-owner-warranty-code"
                      onChange={(event) =>
                        workflow.setWarrantyCode(event.target.value)
                      }
                      placeholder={t("warrantyCodePlaceholder")}
                      value={workflow.warrantyCode}
                    />
                  </div>
                ) : null}
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="assign-owner-purchase-date">
                  {t("purchaseDate")}
                </Label>
                <DatePicker
                  ariaLabel={t("purchaseDate")}
                  id="assign-owner-purchase-date"
                  onValueChange={workflow.setPurchaseDate}
                  placeholder={t("selectPurchaseDate")}
                  value={workflow.purchaseDate}
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
              onClick={handleAssignClick}
              type="button"
            >
              {t("assignOwner")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            {t("ownerOverrideTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("ownerOverrideDescription", {
              currentOwner: currentOwnerName,
              newOwner: selectedCustomer?.fullName ?? "-",
              product: product?.name ?? "",
            })}
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={() => setConfirmOpen(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={workflow.isAssigning}
              onClick={() => {
                setConfirmOpen(false);
                void workflow.confirm();
              }}
              type="button"
            >
              {t("confirmOverride")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CustomerReadonlyCard({ customer }: { customer: CustomerSummary }) {
  const t = useTranslations("Products");

  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {t("selectedCustomer")}
      </h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <DetailItem label={t("customer")} value={customer.fullName} />
        <DetailItem label={t("customerCode")} value={customer.customerCode} />
        <DetailItem label={t("phone")} value={customer.phone ?? "-"} />
        <DetailItem label={t("email")} value={customer.email ?? "-"} />
        <div className="sm:col-span-2">
          <DetailItem label={t("address")} value={customer.address ?? "-"} />
        </div>
      </dl>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}

function formatCustomerOption(customer: CustomerSummary) {
  return [
    customer.fullName,
    customer.customerCode,
    customer.phone,
    customer.email,
  ]
    .filter(Boolean)
    .join(" · ");
}
