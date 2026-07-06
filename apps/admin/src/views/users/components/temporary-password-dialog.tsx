"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
} from "@repo/ui";
import { useToast } from "@/src/hooks/use-toast";

type TemporaryPasswordDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  password: string | null;
};

export function TemporaryPasswordDialog({
  onOpenChange,
  open,
  password,
}: TemporaryPasswordDialogProps) {
  const t = useTranslations("Staff");
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t("temporaryPasswordCopied"));
    } catch {
      toast.error(t("temporaryPasswordCopyError"));
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCopied(false);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{t("temporaryPasswordTitle")}</DialogTitle>
        <DialogDescription className="mt-2">
          {t("temporaryPasswordDescription")}
        </DialogDescription>

        <div className="mt-5 flex gap-2">
          <Input
            aria-label={t("temporaryPassword")}
            className="font-mono"
            readOnly
            value={password ?? ""}
          />
          <Button
            aria-label={t("copyTemporaryPassword")}
            onClick={copyPassword}
            type="button"
            variant="secondary"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? t("copied") : t("copy")}
          </Button>
        </div>

        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          {t("temporaryPasswordWarning")}
        </p>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => handleOpenChange(false)} type="button">
            {t("continueToPermissions")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
