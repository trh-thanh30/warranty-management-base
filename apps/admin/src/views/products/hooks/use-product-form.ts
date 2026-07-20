"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import { useForm, type UseFormSetError } from "react-hook-form";
import {
  getRemovedMediaUrls,
  HttpClientError,
  type CreateProductBody,
  type ProductResponse,
  type UpdateProductBody,
} from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { useCategories } from "../../categories/hooks/use-categories";
import { useCustomers } from "../../customers/hooks/use-customers";
import {
  type ProductFormInput,
  productFormSchema,
  type ProductFormValues,
} from "../products.types";
import { useCreateProduct, useUpdateProduct } from "./use-products";
import {
  toOptionalValue,
  toNullableValue,
  toOptionalRichText,
  toNullableRichText,
} from "@/src/utils";

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
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(null),
  });
  const customerSearch = watch("customerId");
  const debouncedCustomerSearch = useDebounce(customerSearch.trim(), 300);
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
  const customersQuery = useCustomers(
    {
      limit: 20,
      search: debouncedCustomerSearch || undefined,
    },
    { enabled: creating },
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
        toUpdateProductBody(values),
      );
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
    customersQuery,
    errors,
    isSubmitting,
    onSubmit: handleSubmit(submit),
    register,
    watch,
  };
}

function getDefaultValues(product: ProductResponse | null): ProductFormInput {
  return {
    activatedAt: "",
    autoGenerateWarrantyCode: true,
    brand: product?.brand ?? "",
    category: product?.category ?? "CAR",
    categoryId: product?.categoryId ?? "",
    customerId: "",
    description: product?.description ?? "",
    durationMonths: product?.warranty?.durationMonths ?? undefined,
    manufactureYear: product?.manufactureYear ?? undefined,
    metadata: "",
    model: product?.model ?? "",
    name: product?.name ?? "",
    purchaseDate: "",
    serialNumber: product?.serialNumber ?? "",
    status: product?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    warrantyCode: "",
    warrantyTerms: product?.warranty?.terms ?? "",
  };
}

function toCreateProductBody(values: ProductFormValues): CreateProductBody {
  return {
    activatedAt: toOptionalValue(values.activatedAt),
    autoGenerateWarrantyCode: values.autoGenerateWarrantyCode,
    brand: toOptionalValue(values.brand),
    category: values.category,
    categoryId: toOptionalValue(values.categoryId),
    customerId: toOptionalValue(values.customerId),
    description: toOptionalRichText(values.description),
    durationMonths: values.durationMonths,
    manufactureYear: values.manufactureYear,
    model: toOptionalValue(values.model),
    name: values.name.trim(),
    purchaseDate: toOptionalValue(values.purchaseDate),
    serialNumber: toOptionalValue(values.serialNumber),
    status: values.status,
    warrantyCode: values.autoGenerateWarrantyCode
      ? undefined
      : values.warrantyCode.trim().toUpperCase(),
    warrantyTerms: toOptionalValue(values.warrantyTerms),
  };
}

function toUpdateProductBody(values: ProductFormValues): UpdateProductBody {
  return {
    brand: toNullableValue(values.brand),
    category: values.category,
    categoryId: toNullableValue(values.categoryId),
    description: toNullableRichText(values.description),
    manufactureYear: values.manufactureYear ?? null,
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
    "Customer not found": ["customerId", "customerNotFound"],
    "Product category not found": ["categoryId", "categoryNotFound"],
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
    "Warranty code already exists": ["warrantyCode", "duplicateWarrantyCode"],
    "Warranty code is required": ["warrantyCode", "warrantyCodeRequired"],
    "Warranty code must be 6-64 uppercase letters, numbers, or dashes": [
      "warrantyCode",
      "warrantyCodeInvalid",
    ],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
