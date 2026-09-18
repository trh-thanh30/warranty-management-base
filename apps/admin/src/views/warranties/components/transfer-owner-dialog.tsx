"use client";

import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { useToast } from "@/src/hooks/use-toast";
import { useTransferWarrantyOwner } from "@/src/hooks/use-warranties";
import { useDebounce } from "@repo/hooks";
import type { CustomerSummary, WarrantyListItem } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useInfiniteCustomers } from "../../customers/hooks/use-customers";

type OwnerOption = Pick<
  CustomerSummary,
  "id" | "fullName" | "customerCode" | "email" | "phone"
>;

function formatOwnerOption(owner: OwnerOption) {
  return [owner.fullName, owner.customerCode].filter(Boolean).join(" · ");
}

export function TransferOwnerDialog({
  open,
  warranty,
  onOpenChange,
  onTransferred,
}: {
  open: boolean;
  warranty: WarrantyListItem | null;
  onOpenChange: (open: boolean) => void;
  onTransferred: () => void;
}) {
  const t = useTranslations("Warranties");
  const toast = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<OwnerOption | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const customersQuery = useInfiniteCustomers(
    { limit: 20, search: debouncedSearch || undefined },
    { enabled: open },
  );
  const transfer = useTransferWarrantyOwner(warranty?.id ?? null);
  const currentOwner = warranty?.owner;
  const currentOwnerId = currentOwner?.customerId ?? "";
  const currentOwnerOption: OwnerOption | null = currentOwner
    ? {
        id: currentOwner.customerId,
        fullName: currentOwner.fullName || currentOwner.email || t("owner"),
        customerCode: currentOwner.customerCode ?? "",
        email: currentOwner.email ?? null,
        phone: currentOwner.phone ?? null,
      }
    : null;
  const customerId = selectedCustomer?.id ?? currentOwnerId;
  const customers =
    customersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const options: OwnerOption[] = [
    ...(currentOwnerOption && !search.trim() ? [currentOwnerOption] : []),
    ...customers.filter((customer) => customer.id !== currentOwnerId),
  ];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedCustomer(null);
      setSearch("");
    }
    onOpenChange(nextOpen);
  }

  async function submit() {
    if (!customerId || customerId === currentOwnerId || transfer.isPending)
      return;
    try {
      await transfer.mutateAsync({ customerId });
    } catch {
      toast.error(t("transferOwnerError"));
      return;
    }
    toast.success(t("transferOwnerSuccess"));
    onTransferred();
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">
          {t("transferOwnerTitle")}
        </DialogTitle>
        <DialogDescription className="text-sm font-medium text-gray-500">
          {t("transferOwnerDescription")}
        </DialogDescription>
        <div className="mt-5 space-y-2">
          <Label htmlFor="transfer-warranty-owner">{t("newOwner")}</Label>
          <SearchDropdown
            emptyLabel={t("ownerSearchEmpty")}
            errorLabel={t("ownerSearchError")}
            getItemDisabledReason={(customer) =>
              customer.id === currentOwnerId ? t("currentOwnerDisabled") : null
            }
            getItemKey={(customer) => customer.id}
            id="transfer-warranty-owner"
            isError={customersQuery.isError}
            isItemSelected={(customer) => customer.id === customerId}
            isLoading={customersQuery.isFetching}
            items={options}
            loadingLabel={t("ownerSearchLoading")}
            onItemSelect={(customer) => {
              setSelectedCustomer(customer);
              setSearch("");
            }}
            onReachEnd={() => {
              if (customersQuery.hasNextPage && !customersQuery.isFetching) {
                void customersQuery.fetchNextPage();
              }
            }}
            onRetry={() => void customersQuery.refetch()}
            onSearchChange={(value) => {
              setSelectedCustomer(null);
              setSearch(value);
            }}
            placeholder={t("selectOwner")}
            renderItem={(customer) => (
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">
                  {formatOwnerOption(customer)}
                </span>
                {customer.id === currentOwnerId ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("currentOwnerDisabled")}
                  </span>
                ) : customer.phone || customer.email ? (
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[customer.phone, customer.email]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : null}
              </span>
            )}
            retryLabel={t("ownerSearchRetry")}
            searchValue={search}
            selectedLabel={
              selectedCustomer
                ? formatOwnerOption(selectedCustomer)
                : currentOwnerOption
                  ? formatOwnerOption(currentOwnerOption)
                  : undefined
            }
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={
              !customerId || customerId === currentOwnerId || transfer.isPending
            }
            onClick={() => void submit()}
          >
            {t("transferOwner")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
