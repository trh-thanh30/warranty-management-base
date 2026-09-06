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
  getProductMetadataTextList,
  getProductPhysicalMetadata,
  getProductSpecifications,
  getProductInstallationPosition,
  getProductSaveErrorMatch,
  toCreateProductBody,
  toUpdateProductBody,
} from "../products.utils";

export function useProductForm({
  isClone = false,
  onSaved,
  product,
}: {
  isClone?: boolean;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const creating = isClone || !product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? null);
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(creating ? productFormSchema : productEditFormSchema),
    defaultValues: getDefaultValues(product, isClone),
  });
  const gallery = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });
  const features = useFieldArray({
    control: form.control,
    name: "features",
  });
  const applications = useFieldArray({
    control: form.control,
    name: "applications",
  });
  const specifications = useFieldArray({
    control: form.control,
    name: "specifications",
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
            toUpdateProductBody(
              values,
              getProductPhysicalMetadata(product.metadata),
              product.catalogueMetadata,
            ),
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
    features,
    applications,
    specifications,
    onSubmit: form.handleSubmit(submit),
  };
}

function getDefaultValues(
  product: ProductResponse | null,
  isClone = false,
): ProductFormInput {
  const cover = product?.assets.find((asset) => asset.role === "COVER");
  const gallery =
    product?.assets
      .filter((asset) => asset.role === "GALLERY")
      .map((asset) => ({ assetId: asset.assetId, url: asset.url })) ?? [];

  return {
    displayName: product?.displayName ?? product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    brand: product?.brand ?? "",
    model: product?.model ?? "",
    modelYear: product?.modelYear ?? "",
    shortDescription:
      typeof product?.catalogueMetadata?.shortDescription === "string"
        ? product.catalogueMetadata.shortDescription
        : "",
    description: product?.description ?? "",
    coverAssetId: cover?.assetId ?? "",
    coverImageUrl: cover?.url ?? "",
    galleryImages: gallery,
    features: getProductMetadataTextList(
      product?.catalogueMetadata,
      "features",
    ),
    applications: getProductMetadataTextList(
      product?.catalogueMetadata,
      "applications",
    ),
    specifications: getProductSpecifications(product?.catalogueMetadata),
    installationPosition: getProductInstallationPosition(product?.metadata),
    productCode: isClone ? "" : (product?.productCode ?? ""),
    serialNumber: isClone ? "" : (product?.serialNumber ?? ""),
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    warrantyDurationMonths: product?.warrantyDurationMonths ?? "",
    warrantyTerms: product?.warrantyTerms ?? "",
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
