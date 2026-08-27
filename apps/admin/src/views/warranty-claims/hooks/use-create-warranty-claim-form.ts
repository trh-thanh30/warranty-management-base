"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
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
  buildWarrantyClaimProductQuery,
  getWarrantyClaimRequesterPrefill,
  getWarrantyClaimRequesterValues,
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
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const createMutation = useCreateWarrantyClaim();
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const requesterPrefillCustomerIdRef = useRef<string | null>(null);
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<WarrantyClaimCreateFormValues>({
    resolver: zodResolver(warrantyClaimCreateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const productsQuery = useProducts(
    buildWarrantyClaimProductQuery(debouncedProductSearch),
  );
  const products = productsQuery.data?.items ?? [];
  const customerQuery = useCustomer(
    selectedProduct?.owner?.customerId ?? null,
    { enabled: Boolean(selectedProduct?.owner?.customerId) },
  );
  const setRequesterValues = useCallback(
    (
      values: Pick<
        WarrantyClaimCreateFormValues,
        "requesterName" | "requesterPhone"
      >,
    ) => {
      setValue("requesterName", values.requesterName, {
        shouldDirty: true,
      });
      setValue("requesterPhone", values.requesterPhone, {
        shouldDirty: true,
      });
      clearErrors(["requesterName", "requesterPhone"]);
    },
    [clearErrors, setValue],
  );

  useEffect(() => {
    const customer = customerQuery.data;
    const ownerCustomerId = selectedProduct?.owner?.customerId;
    if (
      !customer ||
      customer.id !== ownerCustomerId ||
      requesterPrefillCustomerIdRef.current === customer.id
    ) {
      return;
    }

    setRequesterValues(getWarrantyClaimRequesterValues(customer));
    requesterPrefillCustomerIdRef.current = customer.id;
  }, [
    customerQuery.data,
    selectedProduct?.owner?.customerId,
    setRequesterValues,
  ]);

  function selectProduct(product: ProductResponse) {
    if (!product.warrantyCode) return;

    requesterPrefillCustomerIdRef.current = null;
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

    const hydratedCustomer =
      customerQuery.data?.id === product.owner?.customerId
        ? customerQuery.data
        : null;
    setRequesterValues(
      getWarrantyClaimRequesterPrefill(product.owner, hydratedCustomer),
    );
    requesterPrefillCustomerIdRef.current = hydratedCustomer?.id ?? null;
  }

  function clearProduct() {
    requesterPrefillCustomerIdRef.current = null;
    setSelectedProduct(null);
    setValue("productId", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setRequesterValues(getWarrantyClaimRequesterValues(null));
  }

  async function submit(values: WarrantyClaimCreateFormValues) {
    try {
      const claim = await createMutation.mutateAsync(
        toCreateWarrantyClaimBody(values),
      );
      toast.success(t("created"));
      onCreated(claim.id);
    } catch (error) {
      const message = resolveWarrantyClaimCreateError(error, t, tApiErrors);
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
