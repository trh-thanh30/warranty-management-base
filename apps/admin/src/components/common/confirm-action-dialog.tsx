"use client";

import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";

type ConfirmActionDialogProps = {
  cancelLabel: string;
  confirmDisabled?: boolean;
  confirmLabel: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  variant?: "primary" | "destructive";
};

export function ConfirmActionDialog({
  cancelLabel,
  confirmDisabled = false,
  confirmLabel,
  description,
  isLoading = false,
  onConfirm,
  onOpenChange,
  open,
  title,
  variant = "primary",
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </DialogDescription>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button disabled={isLoading} type="button" variant="secondary">
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading || confirmDisabled}
            onClick={onConfirm}
            type="button"
            variant={variant}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
