"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import type { ProductResponse } from "@repo/shared";
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
  toCreateProductBody,
  toUpdateProductBody,
} from "../products.utils";

export function useProductForm({
  onSaved,
  product,
}: {
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
    defaultValues: getDefaultValues(product),
  });
  const gallery = useFieldArray({
    control: form.control,
    name: "galleryImages",
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
    form.reset(getDefaultValues(product));
  }, [form, product]);

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
      const handledMessage = handleProductSaveError(error, form.setError, t);
      if (handledMessage) {
        toast.error(handledMessage);
        return;
      }

      const message = getLocalizedApiError(error, t, { apiErrors: tApiErrors });
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    ...form,
    categoriesQuery,
    creating,
    gallery,
    onSubmit: form.handleSubmit(submit),
  };
}

function getDefaultValues(product: ProductResponse | null): ProductFormInput {
  const cover = product?.assets.find((asset) => asset.role === "COVER");
  const gallery =
    product?.assets
      .filter((asset) => asset.role === "GALLERY")
      .map((asset) => ({ assetId: asset.assetId, url: asset.url })) ?? [];

  return {
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    brand: product?.brand ?? "",
    model: product?.model ?? "",
    modelYear: product?.modelYear ?? "",
    description: product?.description ?? "",
    coverAssetId: cover?.assetId ?? "",
    coverImageUrl: cover?.url ?? "",
    galleryImages: gallery,
    displayName: product?.displayName ?? "",
    installationPosition: getProductInstallationPosition(product?.metadata),
    productCode: product?.productCode ?? "",
    serialNumber: product?.serialNumber ?? "",
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    warrantyCode: product?.warrantyCode ?? "",
    warrantyDurationMonths: product?.warranty?.durationMonths ?? "",
    warrantyTerms: product?.warranty?.terms ?? "",
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
