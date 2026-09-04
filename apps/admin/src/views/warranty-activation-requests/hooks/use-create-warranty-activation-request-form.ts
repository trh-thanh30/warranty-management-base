"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryActivationFieldConfig,
  CustomerSummary,
  DealerResponse,
  ProductResponse,
} from "@repo/shared";
import { useTranslations } from "next-intl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormSetValue } from "react-hook-form";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import { useToast } from "@/src/hooks/use-toast";
import { useCreateAdminWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import { parseVietnamAddress } from "@/src/utils";
import { useInfiniteDealers } from "@/src/hooks/use-dealers";
import {
  useCategories,
  useCategoryActivationFields,
} from "../../categories/hooks/use-categories";
import { useInfiniteCustomers } from "../../customers/hooks/use-customers";
import { useInfiniteActivationProductOptions } from "../../products/hooks/use-products";
import { useProduct } from "../../products/hooks/use-products";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
import {
  type WarrantyActivationRequestCreateFormValues,
  warrantyActivationRequestCreateFormSchema,
} from "../warranty-activation-requests.types";
import {
  resolveActivationRequestCreateError,
  resolveScopedProductSearch,
  toAdminActivationRequestBody,
} from "../warranty-activation-requests.utils";
import {
  getActivationProductDisplayName,
  resolveAssignedActivationCodeForProduct,
} from "../warranty-activation-request-product.utils";

const DEFAULT_VALUES: WarrantyActivationRequestCreateFormValues = {
  activationCodeId: "",
  addressDetail: "",
  activationProductIds: {},
  categoryId: "",
  categoryInputValues: {},
  customerBirthdate: "",
  customerEmail: "",
  customerId: "",
  customerName: "",
  customerPhone: "",
  dealerAddress: "",
  dealerDistrict: "",
  dealerId: "",
  dealerName: "",
  dealerPhone: "",
  dealerProvince: "",
  filmFrontLeftSide: "",
  filmFrontRightSide: "",
  filmRearGlass: "",
  filmRearLeftSide: "",
  filmRearRightSide: "",
  filmSunroof: "",
  filmWindshield: "",
  note: "",
  productId: "",
  productName: "",
  provinceCode: "",
  salesName: "",
  vehicleModel: "",
  vehiclePlate: "",
  wardCode: "",
  warrantyCode: "",
};

export function useCreateWarrantyActivationRequestForm({
  onCreated,
  activationCodeId,
  assignedProductId,
}: {
  onCreated: () => void;
  activationCodeId?: string;
  assignedProductId?: string;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const createMutation = useCreateAdminWarrantyActivationRequest();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearchState, setProductSearchState] = useState({
    categoryId: "",
    value: "",
  });
  const [dealerSearch, setDealerSearch] = useState("");
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
    null,
  );
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [selectedActivationCode, setSelectedActivationCode] =
    useState<AvailableActivationCode | null>(null);
  const assignedProductQuery = useProduct(assignedProductId ?? null, {
    enabled: Boolean(assignedProductId),
  });
  const [selectedActivationProducts, setSelectedActivationProducts] = useState<
    Record<string, ProductResponse>
  >({});
  const [selectedDealer, setSelectedDealer] = useState<DealerResponse | null>(
    null,
  );
  const form = useForm<WarrantyActivationRequestCreateFormValues>({
    resolver: zodResolver(warrantyActivationRequestCreateFormSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      activationCodeId: activationCodeId ?? "",
    },
  });
  useEffect(() => {
    form.setValue("activationCodeId", activationCodeId ?? "", {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [activationCodeId, form]);
  const provinceCode = form.watch("provinceCode");
  const categoryId = form.watch("categoryId");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const debouncedCustomerSearch = useDebounce(customerSearch.trim(), 300);
  const debouncedProductSearch = useDebounce(productSearchState, 300);
  const productSearchQuery = resolveScopedProductSearch(
    categoryId,
    debouncedProductSearch,
  );
  const debouncedDealerSearch = useDebounce(dealerSearch.trim(), 300);
  const activationCodesQuery = useInfiniteQuery({
    enabled: !activationCodeId && Boolean(selectedProduct),
    queryKey: ["available-activation-codes", selectedProduct?.id ?? "all"],
    queryFn: ({ pageParam }) =>
      activationCodesService.listAvailableByProduct(selectedProduct?.id, {
        assignment: "ASSIGNED",
        limit: 10,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
  const availableActivationCodes = useMemo(
    () =>
      Array.from(
        new Map(
          (activationCodesQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((code) => [code.id, code]),
        ).values(),
      ),
    [activationCodesQuery.data?.pages],
  );
  const assignedActivationCodeForSelectedProduct = useMemo(
    () =>
      selectedProduct
        ? (availableActivationCodes.find(
            (code) => code.assignedProduct?.id === selectedProduct.id,
          ) ?? null)
        : null,
    [availableActivationCodes, selectedProduct],
  );
  const categoriesQuery = useCategories({
    isActive: "true",
    limit: 100,
    type: "PRODUCT",
  });
  const activationFieldsQuery = useCategoryActivationFields(categoryId, {
    enabled: Boolean(categoryId),
  });
  const activationFields = useMemo<CategoryActivationFieldConfig[]>(() => {
    if (!activationFieldsQuery.data?.activationFormEnabled) return [];
    return [...activationFieldsQuery.data.activationFields].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    );
  }, [activationFieldsQuery.data]);
  const usesProductSelectors = activationFields.some(
    (field) => field.type === "PRODUCT_SELECT",
  );
  const customersQuery = useInfiniteCustomers({
    limit: 20,
    search: debouncedCustomerSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const productsQuery = useInfiniteActivationProductOptions(
    {
      categoryId,
      limit: 20,
      search: productSearchQuery,
    },
    {
      enabled:
        Boolean(categoryId) &&
        activationFieldsQuery.isSuccess &&
        !usesProductSelectors,
    },
  );
  const dealersQuery = useInfiniteDealers({
    isActive: "true",
    limit: 20,
    search: debouncedDealerSearch || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });
  const customers = useMemo(
    () =>
      Array.from(
        new Map(
          (customersQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((customer) => [customer.id, customer]),
        ),
      ).map(([, customer]) => customer),
    [customersQuery.data?.pages],
  );
  const products = useMemo(
    () =>
      !categoryId
        ? []
        : Array.from(
            new Map(
              (productsQuery.data?.pages ?? [])
                .flatMap((page) => page.items)
                .map((product) => [product.id, product]),
            ).values(),
          ),
    [categoryId, productsQuery.data?.pages],
  );
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items],
  );
  const dealers = useMemo(
    () =>
      Array.from(
        new Map(
          (dealersQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((dealer) => [dealer.id, dealer]),
        ),
      ).map(([, dealer]) => dealer),
    [dealersQuery.data?.pages],
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  useEffect(() => {
    const product = assignedProductQuery.data;
    if (!product) return;

    setSelectedProduct(product);
    setProductSearchState({ categoryId: product.categoryId, value: "" });
    setFormValues(
      form.setValue,
      {
        categoryId: product.categoryId,
        productId: product.id,
        productName: getActivationProductDisplayName(product),
        warrantyCode: product.warrantyCode ?? "",
      },
      false,
    );
  }, [assignedProductQuery.data, form.setValue]);

  useEffect(() => {
    if (
      activationCodeId ||
      !selectedProduct ||
      !activationCodesQuery.isSuccess
    ) {
      return;
    }

    const assignedCode = resolveAssignedActivationCodeForProduct(
      selectedProduct.id,
      availableActivationCodes,
    );
    if (!assignedCode) return;

    setSelectedActivationCode((current) =>
      current?.id === assignedCode.id ? current : assignedCode,
    );
    if (form.getValues("activationCodeId") !== assignedCode.id) {
      form.setValue("activationCodeId", assignedCode.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.clearErrors("activationCodeId");
    }
  }, [
    activationCodeId,
    activationCodesQuery.isSuccess,
    availableActivationCodes,
    form,
    selectedProduct,
  ]);

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;

    const ward = wards.find((item) => pendingWardName.includes(item.name));
    if (!ward) return;

    form.setValue("wardCode", String(ward.code), {
      shouldDirty: true,
      shouldValidate: false,
    });
    setPendingWardName(null);
  }, [form, pendingWardName, wards]);

  function selectCustomer(customer: CustomerSummary) {
    const address = parseVietnamAddress(customer.address ?? "", provinces);
    setSelectedCustomer(customer);
    setCustomerSearch("");
    form.clearErrors([
      "addressDetail",
      "customerEmail",
      "customerId",
      "customerName",
      "customerPhone",
      "provinceCode",
      "wardCode",
    ]);
    setFormValues(
      form.setValue,
      {
        addressDetail: address.detail,
        customerBirthdate: customer.birthdate?.slice(0, 10) ?? "",
        customerEmail: customer.email ?? "",
        customerId: customer.id,
        customerName: customer.fullName ?? "",
        customerPhone: customer.phone ?? "",
      },
      false,
    );

    if (address.province) {
      setFormValues(
        form.setValue,
        {
          provinceCode: String(address.province.code),
          wardCode: "",
        },
        false,
      );
      setPendingWardName(address.wardName ?? null);
    }
  }

  function clearCustomer(shouldValidate = true) {
    setSelectedCustomer(null);
    setPendingWardName(null);
    setFormValues(
      form.setValue,
      {
        addressDetail: "",
        customerBirthdate: "",
        customerEmail: "",
        customerId: "",
        customerName: "",
        customerPhone: "",
        provinceCode: "",
        wardCode: "",
      },
      shouldValidate,
    );
  }

  function selectProduct(product: ProductResponse) {
    setSelectedProduct(product);
    setProductSearchState({ categoryId, value: "" });
    setFormValues(form.setValue, {
      productId: product.id,
      productName: getActivationProductDisplayName(product),
      warrantyCode: product.warrantyCode ?? "",
    });
    setSelectedActivationCode(null);
    form.setValue("activationCodeId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  function selectCategory(value: string) {
    if (
      value !== categoryId &&
      categoryId &&
      (selectedProduct ||
        Object.keys(selectedActivationProducts).length > 0 ||
        Object.values(form.getValues("categoryInputValues")).some(Boolean))
    ) {
      setPendingCategoryId(value);
      return false;
    }

    applyCategory(value);
    return true;
  }

  function applyCategory(value: string) {
    setProductSearchState({ categoryId: value, value: "" });
    setFormValues(form.setValue, {
      activationProductIds: {},
      categoryId: value,
      categoryInputValues: {},
    });
    setSelectedActivationProducts({});
    clearProduct();
  }

  function confirmCategoryChange() {
    if (!pendingCategoryId) return;
    applyCategory(pendingCategoryId);
    setPendingCategoryId(null);
  }

  function cancelCategoryChange() {
    setPendingCategoryId(null);
  }

  function clearProduct() {
    setSelectedProduct(null);
    setFormValues(form.setValue, {
      productId: "",
      productName: "",
      vehicleModel: "",
      vehiclePlate: "",
      warrantyCode: "",
    });
    setSelectedActivationCode(null);
    form.setValue("activationCodeId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  function setProductSearch(value: string) {
    setProductSearchState({ categoryId, value });
  }

  function selectActivationProduct(
    positionKey: string,
    product: ProductResponse,
  ) {
    const isSelectedElsewhere = Object.entries(selectedActivationProducts).some(
      ([key, selected]) => key !== positionKey && selected.id === product.id,
    );
    if (isSelectedElsewhere) return;

    setSelectedActivationProducts((current) => ({
      ...current,
      [positionKey]: product,
    }));
    form.setValue(`activationProductIds.${positionKey}`, product.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function clearActivationProduct(positionKey: string) {
    setSelectedActivationProducts((current) => {
      const next = { ...current };
      delete next[positionKey];
      return next;
    });
    form.setValue(`activationProductIds.${positionKey}`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function selectDealer(dealer: DealerResponse) {
    setSelectedDealer(dealer);
    setDealerSearch("");
    setFormValues(form.setValue, {
      dealerAddress: dealer.address,
      dealerDistrict: dealer.district ?? "",
      dealerId: dealer.id,
      dealerName: dealer.name,
      dealerPhone: dealer.phone ?? "",
      dealerProvince: dealer.province,
      salesName: dealer.salesName ?? "",
    });
  }

  function clearDealer() {
    setSelectedDealer(null);
    setFormValues(form.setValue, {
      dealerAddress: "",
      dealerDistrict: "",
      dealerId: "",
      dealerName: "",
      dealerPhone: "",
      dealerProvince: "",
      salesName: "",
    });
  }

  function loadMoreProducts() {
    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      void productsQuery.fetchNextPage();
    }
  }

  async function submit(values: WarrantyActivationRequestCreateFormValues) {
    const hasActivationCode = Boolean(
      values.activationCodeId || activationCodeId,
    );

    if (!hasActivationCode) {
      const message = t("activationCodeRequired");
      toast.error(message);
      return;
    }

    // When the request is created from an activation code, the backend resolves
    // and locks the product from that code. There is intentionally no product
    // selector in this mode, so do not require a locally selected product.
    if (!usesProductSelectors && !selectedProduct) {
      const message = t("productRequired");
      form.setError("productId", { message });
      toast.error(message);
      return;
    }

    if (
      usesProductSelectors &&
      Object.keys(selectedActivationProducts).length === 0
    ) {
      const firstProductField = activationFields.find(
        (field) => field.type === "PRODUCT_SELECT",
      );
      const message = t("activationProductRequired");
      if (firstProductField) {
        form.setError(`activationProductIds.${firstProductField.key}`, {
          message,
        });
      }
      toast.error(message);
      return;
    }

    const missingRequiredField = activationFields.find((field) => {
      if (!field.required) return false;
      return field.type === "PRODUCT_SELECT"
        ? !selectedActivationProducts[field.key]
        : !values.categoryInputValues[field.key]?.trim();
    });

    if (missingRequiredField) {
      const message = t("activationFieldValueRequired");
      if (missingRequiredField.type === "PRODUCT_SELECT") {
        form.setError(`activationProductIds.${missingRequiredField.key}`, {
          message: t("activationProductRequired"),
        });
      } else {
        form.setError(`categoryInputValues.${missingRequiredField.key}`, {
          message,
        });
      }
      toast.error(message);
      return;
    }

    try {
      await createMutation.mutateAsync(
        toAdminActivationRequestBody({
          activationFields,
          activationProducts: selectedActivationProducts,
          product: selectedProduct,
          provinces,
          values,
          wards,
        }),
      );
      toast.success(t("created"));
      onCreated();
    } catch (error) {
      const message = resolveActivationRequestCreateError(error, t, tApiErrors);
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    activationFields,
    activationFieldsQuery,
    clearCustomer,
    clearDealer,
    control: form.control,
    categories,
    categoriesQuery,
    categoryChangePending: Boolean(pendingCategoryId),
    categoryId,
    customerSearch,
    customers,
    customersQuery,
    dealerSearch,
    dealers,
    dealersQuery,
    errors: form.formState.errors,
    isSaving: form.formState.isSubmitting || createMutation.isPending,
    loadMoreProducts,
    mutationIsPending: createMutation.isPending,
    onSubmit: form.handleSubmit(submit),
    productSearch: productSearchState.value,
    products,
    productsQuery,
    register: form.register,
    selectedCustomer,
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectedActivationProducts,
    activationCodesQuery,
    selectedActivationCode,
    assignedActivationCodeForSelectedProduct,
    confirmCategoryChange,
    cancelCategoryChange,
    selectCategory,
    selectCustomer,
    selectDealer,
    selectProduct,
    selectActivationProduct,
    clearProduct,
    clearActivationProduct,
    setCustomerSearch,
    setDealerSearch,
    setProductSearch,
    usesProductSelectors,
  };
}

function setFormValues(
  setValue: UseFormSetValue<WarrantyActivationRequestCreateFormValues>,
  values: Partial<WarrantyActivationRequestCreateFormValues>,
  shouldValidate = true,
) {
  for (const [field, value] of Object.entries(values)) {
    setValue(field as keyof WarrantyActivationRequestCreateFormValues, value, {
      shouldDirty: true,
      shouldValidate,
    });
  }
}
