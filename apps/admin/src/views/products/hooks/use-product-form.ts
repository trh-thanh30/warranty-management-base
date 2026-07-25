"use client";

import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type UseFormSetError } from "react-hook-form";
import {
  HttpClientError,
  type ProductResponse,
  type ProductTemplateSummary,
} from "@repo/shared";
import { useProductTemplates } from "@/src/hooks/use-product-templates";
import { useToast } from "@/src/hooks/use-toast";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  type ProductFormInput,
  productFormSchema,
  type ProductFormValues,
} from "../products.types";
import { useCreateProduct, useUpdateProduct } from "./use-products";
import {
  getProductInstallationPosition,
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
  const toast = useToast();
  const creating = !product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? null);
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(product, initialTemplate),
  });
  const { control, reset, setError, setValue } = form;
  const selectedTemplateId = useWatch({ control, name: "templateId" });
  const selectedCategoryId = useWatch({ control, name: "categoryId" });
  const previousTemplateId = useRef(selectedTemplateId);
  const templatesQuery = useProductTemplates(
    { isActive: true, limit: 100, page: 1 },
    { enabled: creating },
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
    if (
      !initialTemplate ||
      items.some((item) => item.id === initialTemplate.id)
    ) {
      return items;
    }
    return [initialTemplate, ...items];
  }, [initialTemplate, templatesQuery.data?.items]);
  const selectedTemplate =
    product?.template ??
    templates.find((template) => template.id === selectedTemplateId) ??
    (initialTemplate?.id === selectedTemplateId ? initialTemplate : null);

  useEffect(() => {
    reset(getDefaultValues(product, initialTemplate));
    previousTemplateId.current =
      product?.templateId ?? initialTemplate?.id ?? "";
  }, [initialTemplate, product, reset]);

  useEffect(() => {
    if (!creating || !selectedTemplate) return;
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

      const message =
        error instanceof HttpClientError ? error.message : t("saveError");
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
  };
}

function handleProductSaveError(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return null;

  const messages = {
    "Product code already exists": ["productCode", "duplicateProductCode"],
    "Product category not found": ["categoryId", "categoryNotFound"],
    "Product template not found": ["templateId", "templateNotFound"],
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
