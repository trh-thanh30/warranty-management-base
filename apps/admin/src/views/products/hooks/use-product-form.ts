"use client";

import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type UseFormSetError } from "react-hook-form";
import {
  type ProductResponse,
  type ProductTemplateSummary,
} from "@repo/shared";
import { useProductTemplates } from "@/src/hooks/use-product-templates";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  type ProductFormInput,
  productEditFormSchema,
  productFormSchema,
  type ProductFormValues,
} from "../products.types";
import { useCreateProduct, useUpdateProduct } from "./use-products";
import {
  getProductInstallationPosition,
  getProductSaveErrorMatch,
  resolveProductCategoryId,
  toCreateProductBody,
  toUpdateProductBody,
} from "../products.utils";

export function useProductForm({
  initialTemplate,
  onSaved,
  product,
}: {
  initialTemplate?: ProductTemplateSummary | null;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const creating = !product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? null);
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(creating ? productFormSchema : productEditFormSchema),
    defaultValues: getDefaultValues(product, initialTemplate),
  });
  const { control, reset, setError, setValue } = form;
  const selectedTemplateId = useWatch({ control, name: "templateId" });
  const selectedCategoryId = useWatch({ control, name: "categoryId" });
  const previousTemplateId = useRef(selectedTemplateId);
  const templatesQuery = useProductTemplates(
    { isActive: true, limit: 100, page: 1 },
    { enabled: true },
  );
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
  const templates = useMemo(() => {
    const items = templatesQuery.data?.items ?? [];
    const currentTemplate = product?.template ?? initialTemplate;
    if (
      !currentTemplate ||
      items.some((item) => item.id === currentTemplate.id)
    ) {
      return items;
    }
    return [currentTemplate, ...items];
  }, [initialTemplate, product?.template, templatesQuery.data?.items]);
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    (product?.templateId === selectedTemplateId ? product.template : null) ??
    (initialTemplate?.id === selectedTemplateId ? initialTemplate : null);

  useEffect(() => {
    reset(getDefaultValues(product, initialTemplate));
    previousTemplateId.current =
      product?.templateId ?? initialTemplate?.id ?? "";
  }, [initialTemplate, product, reset]);

  useEffect(() => {
    if (!selectedTemplate) return;
    if (previousTemplateId.current === selectedTemplate.id) return;

    previousTemplateId.current = selectedTemplate.id;
    setValue(
      "categoryId",
      resolveProductCategoryId({
        currentCategoryId: selectedCategoryId,
        templateCategoryId: selectedTemplate.categoryId,
        templateChanged: true,
      }),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    if (creating) {
      setValue(
        "warrantyDurationMonths",
        selectedTemplate.defaultWarrantyDurationMonths ?? "",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    }
  }, [creating, selectedCategoryId, selectedTemplate, setValue]);

  async function submit(values: ProductFormValues) {
    try {
      const saved = creating
        ? await createProduct.mutateAsync(toCreateProductBody(values))
        : await updateProduct.mutateAsync(
            toUpdateProductBody(values, product.metadata),
          );
      toast.success(creating ? t("created") : t("updated"));
      onSaved(saved);
    } catch (error) {
      const handledMessage = handleProductSaveError(error, setError, t);
      if (handledMessage) {
        toast.error(handledMessage);
        return;
      }

      const message = getLocalizedApiError(error, t, { apiErrors: tApiErrors });
      setError("root", { message });
      toast.error(message);
    }
  }

  function restoreTemplateCategory() {
    if (!selectedTemplate) return;
    setValue("categoryId", selectedTemplate.categoryId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return {
    ...form,
    categoriesQuery,
    creating,
    isCategoryOverridden: Boolean(
      selectedTemplate && selectedCategoryId !== selectedTemplate.categoryId,
    ),
    onSubmit: form.handleSubmit(submit),
    restoreTemplateCategory,
    selectedTemplate,
    selectedTemplateId,
    templates,
    templatesQuery,
  };
}

function getDefaultValues(
  product: ProductResponse | null,
  initialTemplate?: ProductTemplateSummary | null,
): ProductFormInput {
  const template = product?.template ?? initialTemplate;
  return {
    categoryId: product?.categoryId ?? template?.categoryId ?? "",
    displayName: product?.displayName ?? "",
    installationPosition: getProductInstallationPosition(product?.metadata),
    productCode: product?.productCode ?? "",
    serialNumber: product?.serialNumber ?? "",
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    templateId: product?.templateId ?? template?.id ?? "",
    warrantyCode: product?.warrantyCode ?? "",
    warrantyDurationMonths:
      product?.warranty?.durationMonths ??
      template?.defaultWarrantyDurationMonths ??
      "",
  };
}

function handleProductSaveError(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
  t: (key: string) => string,
) {
  const match = getProductSaveErrorMatch(error);
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
