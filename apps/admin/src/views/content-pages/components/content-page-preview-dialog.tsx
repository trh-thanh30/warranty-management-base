"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  PolicyDocument,
} from "@repo/ui";

export function ContentPagePreviewDialog({
  content,
  open,
  onOpenChange,
  summary,
  title,
}: {
  content: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  title: string;
}) {
  const t = useTranslations("ContentPages");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-1rem),70rem)] max-w-none overflow-hidden border-0 bg-white p-0 sm:w-[min(calc(100vw-2rem),70rem)]">
        <DialogTitle className="sr-only">
          {title || t("previewUntitled")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("previewDescription")}
        </DialogDescription>
        <div className="max-h-[85dvh] overflow-y-auto">
          <PolicyDocument
            content={content}
            emptyDescription={t("previewEmptyDescription")}
            emptyTitle={t("previewEmptyTitle")}
            eyebrow={t("previewEyebrow")}
            summary={summary}
            title={title || t("previewUntitled")}
            updatedText={t("previewDraftLabel")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
