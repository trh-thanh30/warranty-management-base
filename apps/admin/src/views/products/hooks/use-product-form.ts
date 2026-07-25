"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormSetError,
} from "react-hook-form";
import {
  getRemovedMediaUrls,
  HttpClientError,
  type ProductResponse,
  type UpdateProductBody,
} from "@repo/shared";
import { isProductCategory } from "@repo/shared/constants";
import { useToast } from "@/src/hooks/use-toast";
import type { ProductImportRowData } from "@/src/services/products/products.types";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  type ProductFormInput,
  productFormSchema,
  type ProductFormValues,
} from "../products.types";
import {
  useAttachProductAsset,
  useCreateProduct,
  useRemoveProductAsset,
  useUpdateProduct,
  useUpdateProductPublication,
} from "./use-products";
import {
  getProductSpecifications,
  getProductInstallationPosition,
  mergeProductInstallationPosition,
  mergeProductSpecifications,
  toCreateProductBody,
  toProductSlugPreview,
} from "../products.utils";
import {
  toNullableRichText,
  toNullableValue,
  toOptionalValue,
} from "@/src/utils";

export function useProductForm({
  importPreview,
  onSaved,
  product,
}: {
  importPreview?: {
    data: ProductImportRowData;
    onSaved: (data: ProductImportRowData) => void;
  };
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const toast = useToast();
  const creating = !product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? null);
  const updatePublication = useUpdateProductPublication(product?.id ?? null);
  const attachProductAsset = useAttachProductAsset(product?.id ?? null);
  const removeProductAsset = useRemoveProductAsset(product?.id ?? null);
  const {
    control,
    formState: { dirtyFields, errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(null),
  });
  const {
    append: appendSpecification,
    fields: specificationFields,
    move: moveSpecification,
    remove: removeSpecification,
  } = useFieldArray({
    control,
    name: "specifications",
  });
  const productName = useWatch({ control, name: "name" });
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
  const importPreviewData = importPreview?.data;

  useEffect(() => {
    reset(
      importPreviewData
        ? getImportPreviewDefaultValues(importPreviewData)
        : getDefaultValues(product),
    );
  }, [importPreviewData, product, reset]);

  useEffect(() => {
    if (!creating || importPreview || dirtyFields.slug) return;

    setValue("slug", toProductSlugPreview(productName ?? ""), {
      shouldValidate: Boolean(productName),
    });
  }, [creating, dirtyFields.slug, importPreview, productName, setValue]);

  async function submit(values: ProductFormValues) {
    if (importPreview) {
      importPreview.onSaved(toImportRowData(values));
      return;
    }

    try {
      if (creating) {
        const createdProduct = await createProduct.mutateAsync(
          toCreateProductBody(values),
        );
        toast.success(t("created"));
        onSaved(createdProduct);
        return;
      }

      let updatedProduct = await updateProduct.mutateAsync(
        toUpdateProductBody(values, product.metadata),
      );
      const existingCover = product.assets.find(
        (asset) => asset.role === "COVER",
      );
      if (values.coverAssetId !== (existingCover?.assetId ?? "")) {
        if (values.coverAssetId) {
          await attachProductAsset.mutateAsync({
            assetId: values.coverAssetId,
            role: "COVER",
            altText: values.name,
          });
        } else if (existingCover) {
          await removeProductAsset.mutateAsync(existingCover.id);
        }
      }
      if (values.isPublished !== product.isPublished) {
        updatedProduct = await updatePublication.mutateAsync({
          isPublished: values.isPublished,
        });
      }
      const removedMediaCount = getRemovedMediaUrls(
        product.description ?? "",
        values.description,
      ).length;
      toast.success(
        removedMediaCount > 0
          ? t("mediaRemoved", { count: removedMediaCount })
          : t("updated"),
      );
      onSaved(updatedProduct);
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

  return {
    categoriesQuery,
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit: handleSubmit(submit),
    register,
    appendSpecification,
    moveSpecification,
    removeSpecification,
    setValue,
    specificationFields,
  };
}

function getDefaultValues(product: ProductResponse | null): ProductFormInput {
  const specifications = getProductSpecifications(product?.metadata);

  return {
    brand: product?.brand ?? "",
    category: product?.category ?? "CAR",
    categoryId: product?.categoryId ?? "",
    coverAssetId:
      product?.assets.find((asset) => asset.role === "COVER")?.assetId ?? "",
    coverImageUrl:
      product?.assets.find((asset) => asset.role === "COVER")?.url ?? "",
    description: product?.description ?? "",
    installationPosition: getProductInstallationPosition(product?.metadata),
    isPublished: product?.isPublished ?? false,
    manufactureYear: product?.manufactureYear ?? undefined,
    model: product?.model ?? "",
    name: product?.name ?? "",
    productCode: "",
    serialNumber: product?.serialNumber ?? "",
    slug: product?.slug ?? "",
    specifications: specifications.length
      ? specifications
      : [{ key: "", value: "" }],
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    warrantyDurationMonths: undefined,
    warrantyTerms: "",
  };
}

function getImportPreviewDefaultValues(
  data: ProductImportRowData,
): ProductFormInput {
  return {
    brand: data.brand ?? "",
    category: normalizeCategory(data.category),
    categoryId: data.categoryCode ?? "",
    coverAssetId: "",
    coverImageUrl: data.imageUrl ?? "",
    description: data.description ?? "",
    installationPosition: data.installationPosition ?? "",
    isPublished: false,
    manufactureYear: data.manufactureYear ?? undefined,
    model: data.model ?? "",
    name: data.name ?? "",
    productCode: data.productCode ?? "",
    serialNumber: data.serialNumber ?? "",
    slug: "",
    specifications: [{ key: "", value: "" }],
    status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    warrantyDurationMonths: data.warrantyDurationMonths ?? undefined,
    warrantyTerms: data.warrantyTerms ?? "",
  };
}

function toImportRowData(values: ProductFormValues): ProductImportRowData {
  return {
    brand: toNullableValue(values.brand),
    category: values.category,
    categoryCode: toNullableValue(values.categoryId),
    description: toNullableValue(values.description),
    imageUrl: toNullableValue(values.coverImageUrl),
    installationPosition: toNullableValue(values.installationPosition),
    manufactureYear: values.manufactureYear ?? null,
    model: toNullableValue(values.model),
    name: values.name.trim(),
    productCode: toNullableValue(values.productCode),
    serialNumber: toNullableValue(values.serialNumber),
    status: values.status,
    warrantyDurationMonths: values.warrantyDurationMonths ?? null,
    warrantyTerms: toNullableValue(values.warrantyTerms),
  };
}

function normalizeCategory(value: string): ProductFormValues["category"] {
  return isProductCategory(value) ? value : "CAR";
}

function toUpdateProductBody(
  values: ProductFormValues,
  existingMetadata: Record<string, unknown> | null,
): UpdateProductBody {
  return {
    brand: toNullableValue(values.brand),
    category: values.category,
    categoryId: values.categoryId,
    description: toNullableRichText(values.description),
    manufactureYear: values.manufactureYear ?? null,
    metadata: mergeProductInstallationPosition(
      mergeProductSpecifications(existingMetadata, values.specifications),
      values.installationPosition,
    ),
    model: toNullableValue(values.model),
    name: values.name.trim(),
    serialNumber: toNullableValue(values.serialNumber),
    slug: toOptionalValue(values.slug),
  };
}

function handleProductSaveError(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return null;

  const messages = {
    "Product cover asset not found": ["coverAssetId", "coverAssetNotFound"],
    "Product category not found": ["categoryId", "categoryNotFound"],
    "Product slug already exists": ["slug", "duplicateSlug"],
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
