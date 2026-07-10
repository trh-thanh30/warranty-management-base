"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  useForm,
  type UseFormSetError,
  type UseFormSetValue,
} from "react-hook-form";
import {
  HttpClientError,
  type CategoryResponse,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "../categories.types";
import { useCreateCategory, useUpdateCategory } from "./use-categories";

export function useCategoryForm({
  category,
  onSaved,
}: {
  category: CategoryResponse | null;
  onSaved: () => void;
}) {
  const t = useTranslations("Categories");
  const toast = useToast();
  const creating = !category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(category?.id ?? null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getDefaultValues(null),
  });

  useEffect(() => {
    reset(getDefaultValues(category));
  }, [category, reset]);

  async function submit(values: CategoryFormValues) {
    const metadata = parseMetadata(values.metadata, setError, t);
    if (!metadata.ok) return;

    try {
      if (creating) {
        await createCategory.mutateAsync(
          toCreateCategoryBody(values, metadata.value),
        );
        toast.success(t("created"));
        onSaved();
        return;
      }

      await updateCategory.mutateAsync(
        toUpdateCategoryBody(values, metadata.value),
      );
      toast.success(t("updated"));
      onSaved();
    } catch (error) {
      const handledMessage = handleCategorySaveError(error, setError, t);
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

  return {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit: handleSubmit(submit),
    register,
    setValue,
    watch,
  };
}

function getDefaultValues(
  category: CategoryResponse | null,
): CategoryFormValues {
  return {
    code: category?.code ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    imageUrl: category?.imageUrl ?? "",
    isActive: category?.isActive ?? true,
    metadata: category?.metadata
      ? JSON.stringify(category.metadata, null, 2)
      : "",
    name: category?.name ?? "",
    order: category?.order ?? 0,
    parentId: category?.parentId ?? "",
    slug: category?.slug ?? "",
    type: category?.type ?? "PRODUCT",
  };
}

function toCreateCategoryBody(
  values: CategoryFormValues,
  metadata: Record<string, unknown> | undefined,
): CreateCategoryBody {
  return {
    code: toOptionalValue(values.code)?.toUpperCase(),
    description: toOptionalValue(values.description),
    icon: toOptionalValue(values.icon),
    imageUrl: toOptionalValue(values.imageUrl),
    isActive: values.isActive,
    metadata,
    name: values.name.trim(),
    order: values.order,
    parentId: toOptionalValue(values.parentId),
    slug: toOptionalValue(values.slug),
    type: values.type,
  };
}

function toUpdateCategoryBody(
  values: CategoryFormValues,
  metadata: Record<string, unknown> | null | undefined,
): UpdateCategoryBody {
  return {
    code: toNullableValue(values.code)?.toUpperCase() ?? null,
    description: toNullableValue(values.description),
    icon: toNullableValue(values.icon),
    imageUrl: toNullableValue(values.imageUrl),
    isActive: values.isActive,
    metadata: metadata ?? null,
    name: values.name.trim(),
    order: values.order,
    parentId: toNullableValue(values.parentId),
    slug: toOptionalValue(values.slug),
  };
}

function parseMetadata(
  value: string,
  setError: UseFormSetError<CategoryFormValues>,
  t: (key: string) => string,
):
  | { ok: true; value: Record<string, unknown> | undefined }
  | { ok: false; value?: never } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: undefined };

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      setError("metadata", { message: t("metadataObjectRequired") });
      return { ok: false };
    }

    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    setError("metadata", { message: t("metadataInvalid") });
    return { ok: false };
  }
}

function toOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function toNullableValue(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function handleCategorySaveError(
  error: unknown,
  setError: UseFormSetError<CategoryFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return null;

  const messages = {
    "Category cannot be its own parent": ["parentId", "parentSelfError"],
    "Category parent would create a cycle": ["parentId", "parentCycleError"],
    "Category slug already exists for this type": ["slug", "duplicateSlug"],
    "Existing category hierarchy contains a cycle": [
      "parentId",
      "parentCycleError",
    ],
    "Parent category must have the same type": ["parentId", "parentTypeError"],
    "Parent category not found": ["parentId", "parentNotFound"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}

export function clearParentOnTypeChange(
  setValue: UseFormSetValue<CategoryFormValues>,
) {
  setValue("parentId", "", {
    shouldDirty: true,
    shouldValidate: true,
  });
}
