"use client";

import type { WarrantyListItem } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useTransferWarrantyOwner } from "@/src/hooks/use-warranties";

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
  const [customerId, setCustomerId] = useState("");
  const customersQuery = useCustomers(
    { page: 1, limit: 100 },
    { enabled: open },
  );
  const transfer = useTransferWarrantyOwner(warranty?.id ?? null);

  async function submit() {
    if (!customerId) return;
    await transfer.mutateAsync({ customerId });
    setCustomerId("");
    onTransferred();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("transferOwnerTitle")}</DialogTitle>
        <DialogDescription>{t("transferOwnerDescription")}</DialogDescription>
        <div className="mt-5 space-y-2">
          <Label>{t("newOwner")}</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectOwner")} />
            </SelectTrigger>
            <SelectContent>
              {customersQuery.data?.items.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.fullName} · {customer.customerCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={!customerId || transfer.isPending}
            onClick={() => void submit()}
          >
            {t("transferOwner")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
