"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WebsiteLocale } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";

type PreviewDataDialogProps = {
  load: (locale: WebsiteLocale) => Promise<unknown>;
  locale: WebsiteLocale;
};

export function PreviewDataDialog({ load, locale }: PreviewDataDialogProps) {
  const t = useTranslations("WebsiteConfig");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<unknown>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function showPreview() {
    setOpen(true);
    setLoading(true);
    setError(false);
    try {
      setData(await load(locale));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => void showPreview()}
        type="button"
        variant="outline"
      >
        <Eye aria-hidden="true" className="size-4" />
        {t("actions.preview")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto">
          <DialogTitle>{t("preview.title")}</DialogTitle>
          <DialogDescription>{t("preview.description")}</DialogDescription>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2
                aria-label={t("states.loading")}
                className="size-6 animate-spin"
              />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600" role="alert">
              {t("states.errorDescription")}
            </p>
          ) : (
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-950 shadow-inner">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
