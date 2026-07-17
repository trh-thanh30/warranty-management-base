"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";

export function ContentPagePreviewDialog({
  content,
  open,
  onOpenChange,
  title,
}: {
  content: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}) {
  const t = useTranslations("ContentPages");
  const document = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px;color:#0f172a;line-height:1.7}img,video{max-width:100%;height:auto}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap;background:#f1f5f9;padding:12px;border-radius:8px}</style></head><body>${content}</body></html>`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-2rem),60rem)] max-w-none p-4 sm:p-6">
        <DialogTitle>{title || t("previewUntitled")}</DialogTitle>
        <DialogDescription>{t("previewDescription")}</DialogDescription>
        <iframe
          className="h-[65dvh] w-full rounded-md border border-slate-200 bg-white dark:border-slate-800"
          sandbox=""
          srcDoc={document}
          title={t("previewFrameTitle")}
        />
      </DialogContent>
    </Dialog>
  );
}
