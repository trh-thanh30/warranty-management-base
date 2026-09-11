"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProductResponse, WarrantyListItem } from "@repo/shared";
import { useInfiniteWarranties } from "@/src/hooks/use-warranties";
import { useToast } from "@/src/hooks/use-toast";
import { useCreateWarrantyClaim } from "@/src/hooks/use-warranty-claims";
import { useCategories } from "../../categories/hooks/use-categories";
import { useCustomer } from "../../customers/hooks/use-customers";
import { useInfiniteProducts } from "../../products/hooks/use-products";
import {
  type WarrantyClaimCreateFormValues,
  warrantyClaimCreateFormSchema,
} from "../warranty-claims.types";
import {
  buildWarrantyClaimProductQuery,
  buildWarrantyClaimWarrantyQuery,
  flattenWarrantyClaimOptions,
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
  const [categoryId, setCategoryId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedFilterProduct, setSelectedFilterProduct] =
    useState<ProductResponse | null>(null);
  const [warrantySearch, setWarrantySearch] = useState("");
  const [selectedWarranty, setSelectedWarranty] =
    useState<WarrantyListItem | null>(null);
  const requesterPrefillCustomerIdRef = useRef<string | null>(null);
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);
  const debouncedWarrantySearch = useDebounce(warrantySearch.trim(), 300);
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
  const categoriesQuery = useCategories({
    isActive: "true",
    limit: 100,
    sortBy: "order",
    sortOrder: "asc",
    type: "PRODUCT",
  });
  const productsQuery = useInfiniteProducts(
    buildWarrantyClaimProductQuery(debouncedProductSearch, categoryId),
  );
  const products = useMemo(
    () =>
      Array.from(
        new Map(
          (productsQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((product) => [product.id, product]),
        ).values(),
      ),
    [productsQuery.data?.pages],
  );
  const warrantiesQuery = useInfiniteWarranties(
    buildWarrantyClaimWarrantyQuery(debouncedWarrantySearch, {
      categoryId,
      productId: selectedFilterProduct?.id,
    }),
  );
  const warranties = useMemo(
    () => flattenWarrantyClaimOptions(warrantiesQuery.data?.pages ?? []),
    [warrantiesQuery.data?.pages],
  );
  const blockedWarranty = useMemo(() => {
    const normalizedSearch = debouncedWarrantySearch.toUpperCase();

    return (
      warranties.find(
        (warranty) =>
          warranty.openClaim &&
          warranty.warrantyCode?.toUpperCase() === normalizedSearch,
      ) ?? null
    );
  }, [debouncedWarrantySearch, warranties]);
  const customerQuery = useCustomer(
    selectedWarranty?.owner?.customerId ?? null,
    { enabled: Boolean(selectedWarranty?.owner?.customerId) },
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
    const ownerCustomerId = selectedWarranty?.owner?.customerId;
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
    selectedWarranty?.owner?.customerId,
    setRequesterValues,
  ]);

  function selectWarranty(warranty: WarrantyListItem) {
    if (!warranty.warrantyCode || !warranty.owner) return;
    requesterPrefillCustomerIdRef.current = null;
    setSelectedWarranty(warranty);
    setWarrantySearch("");
    setValue("productId", warranty.productId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", warranty.warrantyCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const hydratedCustomer =
      customerQuery.data?.id === warranty.owner.customerId
        ? customerQuery.data
        : null;
    setRequesterValues(
      getWarrantyClaimRequesterPrefill(warranty.owner, hydratedCustomer),
    );
    requesterPrefillCustomerIdRef.current = hydratedCustomer?.id ?? null;
  }

  function clearWarranty() {
    requesterPrefillCustomerIdRef.current = null;
    setSelectedWarranty(null);
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

  function changeCategory(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setProductSearch("");
    setSelectedFilterProduct(null);
    clearWarranty();
  }

  function selectFilterProduct(product: ProductResponse) {
    setSelectedFilterProduct(product);
    setProductSearch("");
    clearWarranty();
  }

  function clearProductFilter() {
    setSelectedFilterProduct(null);
    setProductSearch("");
    clearWarranty();
  }

  function clearFilters() {
    setCategoryId("");
    setSelectedFilterProduct(null);
    setProductSearch("");
    clearWarranty();
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
    blockedWarranty,
    categories: categoriesQuery.data?.items ?? [],
    categoriesQuery,
    categoryId,
    changeCategory,
    clearFilters,
    clearProductFilter,
    clearWarranty,
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
    selectedFilterProduct,
    selectedWarranty,
    selectFilterProduct,
    selectWarranty,
    setProductSearch,
    setWarrantySearch,
    warranties,
    warrantiesQuery,
    warrantySearch,
  };
}
