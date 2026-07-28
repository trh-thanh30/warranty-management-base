"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { Eye, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContentPageSummary } from "@repo/shared";
import { Button, Input, Textarea } from "@repo/ui";
import { FormField as Field } from "@/src/components/common/form-field";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { SelectControl } from "@/src/components/common/select-control";
import { CONTENT_PAGE_KINDS } from "../content-pages.constants";
import { useCategories } from "../../categories/hooks/use-categories";
import { useContentPageForm } from "../hooks/use-content-page-form";
import { useParseContentDocument } from "../hooks/use-content-pages";
import { ContentPageFaqItemsEditor } from "./content-page-faq-items-editor";
import { ContentPagePreviewDialog } from "./content-page-preview-dialog";

export function ContentPageForm({
  page,
  onCancel,
  onSaved,
}: {
  page: ContentPageSummary | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("ContentPages");
  const [previewOpen, setPreviewOpen] = useState(false);
  const form = useContentPageForm({ page, onSaved });
  const parseDocument = useParseContentDocument();
  const errors = form.formState.errors;
  const content = form.watch("content");
  const faqItems = form.watch("faqItems");
  const kind = form.watch("kind");
  const summary = form.watch("summary");
  const title = form.watch("title");
  const categoriesQuery = useCategories({
    isActive: "true",
    limit: 100,
    type: "CONTENT_PAGE",
  });

  return (
    <>
      <form className="space-y-6" noValidate onSubmit={form.onSubmit}>
        {errors.root?.message ? (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            error={translateError(errors.title?.message, t)}
            id="content-page-title"
            label={t("titleLabel")}
          >
            <Input
              aria-invalid={Boolean(errors.title)}
              autoComplete="off"
              className="h-11 text-base sm:h-10 sm:text-sm"
              id="content-page-title"
              placeholder={t("titlePlaceholder")}
              {...form.register("title", {
                onChange: (event) =>
                  form.updateSlugFromTitle(event.target.value),
              })}
            />
          </Field>
          <Field
            error={translateError(errors.slug?.message, t)}
            id="content-page-slug"
            label={t("slugLabel")}
          >
            <Input
              aria-invalid={Boolean(errors.slug)}
              autoComplete="off"
              className="h-11 font-mono text-base sm:h-10 sm:text-sm"
              id="content-page-slug"
              placeholder={t("slugPlaceholder")}
              {...form.register("slug", { onChange: form.markSlugEdited })}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            error={translateError(errors.kind?.message, t)}
            id="content-page-kind"
            label={t("kindLabel")}
          >
            <Controller
              control={form.control}
              name="kind"
              render={({ field }) => (
                <SelectControl
                  id="content-page-kind"
                  onValueChange={field.onChange}
                  options={CONTENT_PAGE_KINDS.map((kind) => ({
                    label: t(`kinds.${kind}`),
                    value: kind,
                  }))}
                  triggerClassName="h-11 text-base sm:h-10 sm:text-sm"
                  value={field.value}
                />
              )}
            />
          </Field>
          <Field
            error={translateError(errors.categoryId?.message, t)}
            id="content-page-category"
            label={t("categoryLabel")}
          >
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <SelectControl
                  disabled={categoriesQuery.isLoading}
                  id="content-page-category"
                  onValueChange={field.onChange}
                  options={[
                    { label: t("noCategory"), value: "" },
                    ...(categoriesQuery.data?.items ?? []).map((category) => ({
                      label: category.name,
                      value: category.id,
                    })),
                  ]}
                  triggerClassName="h-11 text-base sm:h-10 sm:text-sm"
                  value={field.value}
                />
              )}
            />
          </Field>
        </div>
        <Field
          error={translateError(errors.summary?.message, t)}
          id="content-page-summary"
          label={t("summaryLabel")}
        >
          <Textarea
            aria-invalid={Boolean(errors.summary)}
            className="resize-y text-base sm:text-sm"
            id="content-page-summary"
            placeholder={t("summaryPlaceholder")}
            rows={4}
            {...form.register("summary")}
          />
        </Field>
        <Field
          error={translateError(
            kind === "FAQ" ? errors.faqItems?.message : errors.content?.message,
            t,
          )}
          id={
            kind === "FAQ" ? "content-page-faq-items" : "content-page-content"
          }
          label={kind === "FAQ" ? t("faqItemsLabel") : t("contentLabel")}
        >
          {kind === "FAQ" ? (
            <ContentPageFaqItemsEditor form={form} pageId={page?.id ?? null} />
          ) : (
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <RichTextEditor
                  disabled={form.isSubmitting}
                  maxLength={20_000}
                  onChange={field.onChange}
                  onImportDocument={async (file) => {
                    const result = await parseDocument.mutateAsync(file);
                    return result.content;
                  }}
                  value={field.value}
                />
              )}
            />
          )}
        </Field>
        <div className="grid gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
          <Button
            className="h-11 w-full sm:h-10 sm:w-auto"
            disabled={form.isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
          <Button
            className="h-11 w-full sm:h-10 sm:w-auto"
            disabled={kind === "FAQ" ? faqItems.length === 0 : !content.trim()}
            onClick={() => setPreviewOpen(true)}
            type="button"
            variant="outline"
          >
            <Eye aria-hidden="true" className="size-4" />
            {t("preview")}
          </Button>
          <Button
            className="h-11 w-full sm:h-10 sm:w-auto"
            disabled={form.isSubmitting}
            type="submit"
          >
            {form.isSubmitting ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {page ? t("save") : t("create")}
          </Button>
        </div>
      </form>
      <ContentPagePreviewDialog
        content={content}
        faqItems={faqItems}
        kind={kind}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
        summary={summary}
        title={title}
      />
    </>
  );
}

function translateError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;
  const keys = new Set([
    "slugRequired",
    "slugLength",
    "slugInvalid",
    "titleRequired",
    "titleLength",
    "summaryLength",
    "contentRequired",
    "faqItemsRequired",
    "faqItemsLength",
    "faqQuestionRequired",
    "faqQuestionLength",
    "faqAnswerRequired",
    "categoryInvalid",
  ]);
  return keys.has(message) ? t(message) : message;
}
