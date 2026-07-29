"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  PolicyDocument,
} from "@repo/ui";
import type { ContentPageFormValues } from "../content-pages.types";

export function ContentPagePreviewDialog({
  content,
  faqItems,
  kind,
  open,
  onOpenChange,
  summary,
  title,
}: {
  content: string;
  faqItems: ContentPageFormValues["faqItems"];
  kind: ContentPageFormValues["kind"];
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
          {kind === "FAQ" ? (
            <FaqPreview
              items={faqItems}
              summary={summary}
              title={title || t("previewUntitled")}
            />
          ) : (
            <PolicyDocument
              content={content}
              emptyDescription={t("previewEmptyDescription")}
              emptyTitle={t("previewEmptyTitle")}
              eyebrow={t("previewEyebrow")}
              summary={summary}
              title={title || t("previewUntitled")}
              updatedText={t("previewDraftLabel")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FaqPreview({
  items,
  summary,
  title,
}: {
  items: ContentPageFormValues["faqItems"];
  summary: string;
  title: string;
}) {
  const t = useTranslations("ContentPages");
  const activeItems = items.filter((item) => item.isActive);

  return (
    <article className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
        {t("previewFaqEyebrow")}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
        {title}
      </h1>
      {summary ? (
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">{summary}</p>
      ) : null}
      <div className="mt-8 space-y-3">
        {activeItems.map((item, index) => (
          <details
            className="group rounded-lg border border-slate-200 bg-white"
            key={`${item.question}-${index}`}
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-slate-900">
              {item.question}
              <ChevronDown className="size-5 shrink-0 text-blue-700 transition-transform group-open:rotate-180" />
            </summary>
            <div
              className="border-t border-slate-100 px-5 py-4 leading-7 text-slate-600 [&_a]:text-blue-700 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </details>
        ))}
        {activeItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center text-slate-500">
            {t("previewFaqEmpty")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
