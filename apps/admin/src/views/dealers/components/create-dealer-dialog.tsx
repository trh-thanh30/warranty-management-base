"use client";

import type { DealerResponse } from "@repo/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { DealerForm } from "./dealer-form";

type CreateDealerDialogProps = {
  onOpenChange: (open: boolean) => void;
  onSaved: (dealer: DealerResponse) => void;
  open: boolean;
};

export function CreateDealerDialog({
  onOpenChange,
  onSaved,
  open,
}: CreateDealerDialogProps) {
  const t = useTranslations("Dealers");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),56rem)] overflow-y-auto p-6">
        <DialogTitle className="text-lg font-semibold">
          {t("createTitle")}
        </DialogTitle>
        <DialogDescription className="mb-5 text-sm text-slate-500">
          {t("createDescription")}
        </DialogDescription>
        <DealerForm
          dealer={null}
          onCancel={() => onOpenChange(false)}
          onSaved={(dealer) => {
            if (dealer) onSaved(dealer);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
