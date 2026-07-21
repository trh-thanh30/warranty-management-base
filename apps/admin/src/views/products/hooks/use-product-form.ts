"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import {
  getRemovedMediaUrls,
  HttpClientError,
  type ProductResponse,
  type UpdateProductBody,
} from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
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
} from "./use-products";
import {
  getProductSpecifications,
  mergeProductSpecifications,
  toCreateProductBody,
} from "../products.utils";
import { toNullableValue, toNullableRichText } from "@/src/utils";

export function useProductForm({
  onSaved,
  product,
}: {
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const toast = useToast();
  const creating = !product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? null);
  const attachProductAsset = useAttachProductAsset(product?.id ?? null);
  const removeProductAsset = useRemoveProductAsset(product?.id ?? null);
  const {
    control,
    formState: { errors, isSubmitting },
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
    reset(getDefaultValues(product));
  }, [product, reset]);

  async function submit(values: ProductFormValues) {
    try {
      if (creating) {
        const createdProduct = await createProduct.mutateAsync(
          toCreateProductBody(values),
        );
        toast.success(t("created"));
        onSaved(createdProduct);
        return;
      }

      const updatedProduct = await updateProduct.mutateAsync(
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
    manufactureYear: product?.manufactureYear ?? undefined,
    model: product?.model ?? "",
    name: product?.name ?? "",
    serialNumber: product?.serialNumber ?? "",
    specifications: specifications.length
      ? specifications
      : [{ key: "", value: "" }],
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function toUpdateProductBody(
  values: ProductFormValues,
  existingMetadata: Record<string, unknown> | null,
): UpdateProductBody {
  return {
    brand: toNullableValue(values.brand),
    category: values.category,
    categoryId: toNullableValue(values.categoryId),
    description: toNullableRichText(values.description),
    manufactureYear: values.manufactureYear ?? null,
    metadata: mergeProductSpecifications(
      existingMetadata,
      values.specifications,
    ),
    model: toNullableValue(values.model),
    name: values.name.trim(),
    serialNumber: toNullableValue(values.serialNumber),
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
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
