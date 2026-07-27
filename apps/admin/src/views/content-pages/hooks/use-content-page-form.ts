"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  getRemovedMediaUrls,
  HttpClientError,
  type ContentPageSummary,
} from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import {
  contentPageFormSchema,
  type ContentPageFormValues,
} from "../content-pages.types";
import {
  getContentPageSaveError,
  slugifyContentPageTitle,
} from "../content-pages.utils";
import {
  useCreateContentPage,
  useUpdateContentPage,
} from "./use-content-pages";

export function useContentPageForm({
  page,
  onSaved,
}: {
  page: ContentPageSummary | null;
  onSaved: () => void;
}) {
  const t = useTranslations("ContentPages");
  const toast = useToast();
  const createPage = useCreateContentPage();
  const updatePage = useUpdateContentPage(page?.id ?? null);
  const slugEdited = useRef(Boolean(page));
  const form = useForm<ContentPageFormValues>({
    resolver: zodResolver(contentPageFormSchema),
    defaultValues: getValues(null),
  });

  useEffect(() => {
    slugEdited.current = Boolean(page);
    form.reset(getValues(page));
  }, [form, page]);

  async function submit(values: ContentPageFormValues) {
    try {
      const removedMediaCount = page
        ? getRemovedMediaUrls(page.content, values.content).length
        : 0;
      const body = {
        ...values,
        categoryId: values.categoryId || null,
        summary: values.summary || undefined,
      };
      if (page) await updatePage.mutateAsync(body);
      else await createPage.mutateAsync(body);
      toast.success(
        removedMediaCount > 0
          ? t("mediaRemoved", { count: removedMediaCount })
          : t(page ? "updated" : "created"),
      );
      onSaved();
    } catch (error) {
      const mapped = getContentPageSaveError(error);
      if (mapped) {
        const message = t(mapped.messageKey);
        form.setError(mapped.field, { message }, { shouldFocus: true });
        toast.error(message);
        return;
      }
      const message =
        error instanceof HttpClientError ? error.message : t("saveError");
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    ...form,
    creating: !page,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(submit),
    updateSlugFromTitle: (title: string) => {
      if (slugEdited.current) return;
      form.setValue("slug", slugifyContentPageTitle(title), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    markSlugEdited: () => {
      slugEdited.current = true;
    },
  };
}

function getValues(page: ContentPageSummary | null): ContentPageFormValues {
  return {
    slug: page?.slug ?? "",
    title: page?.title ?? "",
    summary: page?.summary ?? "",
    content: page?.content ?? "",
    kind: page?.kind ?? "GENERAL_POLICY",
    categoryId: page?.categoryId ?? "",
  };
}
