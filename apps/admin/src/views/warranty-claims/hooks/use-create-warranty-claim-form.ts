"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ProductResponse } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { useCreateWarrantyClaim } from "@/src/hooks/use-warranty-claims";
import { useCustomer } from "../../customers/hooks/use-customers";
import { useProducts } from "../../products/hooks/use-products";
import {
  type WarrantyClaimCreateFormValues,
  warrantyClaimCreateFormSchema,
} from "../warranty-claims.types";
import {
  resolveWarrantyClaimCreateError,
  toCreateWarrantyClaimBody,
} from "../warranty-claims.utils";

const DEFAULT_VALUES: WarrantyClaimCreateFormValues = {
  issueDetail: "",
  issueTitle: "",
  productId: "",
  requesterName: "",
  requesterPhone: "",
  warrantyCode: "",
};

export function useCreateWarrantyClaimForm({
  onCreated,
}: {
  onCreated: (claimId: string) => void;
}) {
  const t = useTranslations("WarrantyClaims");
  const toast = useToast();
  const createMutation = useCreateWarrantyClaim();
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<WarrantyClaimCreateFormValues>({
    resolver: zodResolver(warrantyClaimCreateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const productsQuery = useProducts({
    limit: 20,
    search: debouncedProductSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });
  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).filter(
        (product) => product.warrantyCode !== null,
      ),
    [productsQuery.data?.items],
  );
  const customerQuery = useCustomer(
    selectedProduct?.owner?.customerId ?? null,
    { enabled: Boolean(selectedProduct?.owner?.customerId) },
  );

  function selectProduct(product: ProductResponse) {
    if (!product.warrantyCode) return;

    setSelectedProduct(product);
    setProductSearch("");
    setValue("productId", product.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", product.warrantyCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("requesterName", product.owner?.fullName ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function clearProduct() {
    setSelectedProduct(null);
    setValue("productId", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submit(values: WarrantyClaimCreateFormValues) {
    try {
      const claim = await createMutation.mutateAsync(
        toCreateWarrantyClaimBody(values),
      );
      toast.success(t("created"));
      onCreated(claim.id);
    } catch (error) {
      const message = resolveWarrantyClaimCreateError(error, t);
      setError("root", { message });
      toast.error(message);
    }
  }

  return {
    clearProduct,
    customer: customerQuery.data ?? null,
    customerQuery,
    errors,
    isSaving: isSubmitting || createMutation.isPending,
    mutationIsPending: createMutation.isPending,
    onSubmit: handleSubmit(submit),
    productSearch,
    products,
    productsQuery,
    register,
    selectedProduct,
    selectProduct,
    setProductSearch,
  };
}
