"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { HttpClientError, type ProductTemplateSummary } from "@repo/shared";
import {
  useCreateProductTemplate,
  useUpdateProductTemplate,
} from "@/src/hooks/use-product-templates";
import { useToast } from "@/src/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  productTemplateFormSchema,
  type ProductTemplateFormInput,
  type ProductTemplateFormValues,
} from "../product-templates.types";
import {
  getProductTemplateDefaults,
  toCreateTemplateBody,
  toUpdateTemplateBody,
} from "../product-templates.utils";

export function useProductTemplateForm({
  onSaved,
  template,
}: {
  onSaved: (template: ProductTemplateSummary) => void;
  template: ProductTemplateSummary | null;
}) {
  const t = useTranslations("ProductTemplates");
  const toast = useToast();
  const createTemplate = useCreateProductTemplate();
  const updateTemplate = useUpdateProductTemplate(template?.id ?? null);
  const form = useForm<
    ProductTemplateFormInput,
    unknown,
    ProductTemplateFormValues
  >({
    resolver: zodResolver(productTemplateFormSchema),
    defaultValues: getProductTemplateDefaults(template),
  });
  const { reset } = form;
  const gallery = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });
  const specifications = useFieldArray({
    control: form.control,
    name: "specifications",
  });
  const features = useFieldArray({
    control: form.control,
    name: "features",
  });
  const applications = useFieldArray({
    control: form.control,
    name: "applications",
  });
  const categoriesQuery = useCategories(
    {
      isActive: "true",
      limit: 100,
      sortBy: "order",
      sortOrder: "asc",
      type: "PRODUCT",
    },
    { enabled: true },
  );

  useEffect(() => {
    reset(getProductTemplateDefaults(template));
  }, [reset, template]);

  async function submit(values: ProductTemplateFormValues) {
    try {
      const saved = template
        ? await updateTemplate.mutateAsync(toUpdateTemplateBody(values))
        : await createTemplate.mutateAsync(toCreateTemplateBody(values));
      toast.success(template ? t("updated") : t("created"));
      onSaved(saved);
    } catch (error) {
      if (error instanceof HttpClientError) {
        if (error.message === "Product template SKU already exists") {
          form.setError("sku", { message: "duplicateSku" });
          toast.error(t("duplicateSku"));
          return;
        }
        if (error.message === "Product template slug already exists") {
          form.setError("slug", { message: "duplicateSlug" });
          toast.error(t("duplicateSlug"));
          return;
        }
      }
      const message = error instanceof Error ? error.message : t("saveError");
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    ...form,
    categoriesQuery,
    gallery,
    features,
    applications,
    specifications,
    creating: !template,
    onSubmit: form.handleSubmit(submit),
  };
}
