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
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormSetValue } from "react-hook-form";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import { useToast } from "@/src/hooks/use-toast";
import { useCreateAdminWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import { parseVietnamAddress } from "@/src/utils";
import { useDealers } from "@/src/hooks/use-dealers";
import {
  useCategories,
  useCategoryActivationFields,
} from "../../categories/hooks/use-categories";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useInfiniteProducts } from "../../products/hooks/use-products";
import {
  type WarrantyActivationRequestCreateFormValues,
  warrantyActivationRequestCreateFormSchema,
} from "../warranty-activation-requests.types";
import {
  resolveActivationRequestCreateError,
  resolveScopedProductSearch,
  toAdminActivationRequestBody,
} from "../warranty-activation-requests.utils";
import { getActivationProductDisplayName } from "../warranty-activation-request-product.utils";

const DEFAULT_VALUES: WarrantyActivationRequestCreateFormValues = {
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
}: {
  onCreated: () => void;
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
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [selectedActivationProducts, setSelectedActivationProducts] = useState<
    Record<string, ProductResponse>
  >({});
  const [selectedDealer, setSelectedDealer] = useState<DealerResponse | null>(
    null,
  );
  const form = useForm<WarrantyActivationRequestCreateFormValues>({
    resolver: zodResolver(warrantyActivationRequestCreateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const provinceCode = form.watch("provinceCode");
  const wardCode = form.watch("wardCode");
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
  const customersQuery = useCustomers({
    limit: 20,
    search: debouncedCustomerSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const productsQuery = useInfiniteProducts(
    {
      activationEligible: "true",
      categoryId: categoryId || undefined,
      limit: 20,
      search: productSearchQuery,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "ACTIVE",
    },
    {
      enabled:
        Boolean(categoryId) &&
        activationFieldsQuery.isSuccess &&
        !usesProductSelectors,
    },
  );
  const dealersQuery = useDealers({
    isActive: "true",
    limit: 20,
    search: debouncedDealerSearch || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });
  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data?.items],
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
    () => dealersQuery.data?.items ?? [],
    [dealersQuery.data?.items],
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;

    const ward = wards.find((item) => pendingWardName.includes(item.name));
    if (!ward) return;

    form.setValue("wardCode", String(ward.code), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setPendingWardName(null);
  }, [form, pendingWardName, wards]);

  function selectCustomer(customer: CustomerSummary) {
    const address = parseVietnamAddress(customer.address ?? "", provinces);
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setFormValues(form.setValue, {
      addressDetail: address.detail,
      customerBirthdate: customer.birthdate?.slice(0, 10) ?? "",
      customerEmail: customer.email ?? "",
      customerId: customer.id,
      customerName: customer.fullName ?? "",
      customerPhone: customer.phone ?? "",
    });

    if (address.province) {
      setFormValues(form.setValue, {
        provinceCode: String(address.province.code),
        wardCode: "",
      });
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
  }

  function selectCategory(value: string) {
    if (
      value !== categoryId &&
      categoryId &&
      (selectedProduct ||
        Object.keys(selectedActivationProducts).length > 0 ||
        Object.values(form.getValues("categoryInputValues")).some(Boolean)) &&
      !window.confirm(t("categoryChangeConfirm"))
    ) {
      return false;
    }

    setProductSearchState({ categoryId: value, value: "" });
    setFormValues(form.setValue, {
      activationProductIds: {},
      categoryId: value,
      categoryInputValues: {},
    });
    setSelectedActivationProducts({});
    clearProduct();
    return true;
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

  function selectProvince(value: string) {
    setFormValues(form.setValue, { provinceCode: value, wardCode: "" });
  }

  function selectWard(value: string) {
    setFormValues(form.setValue, { wardCode: value });
  }

  function loadMoreProducts() {
    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      void productsQuery.fetchNextPage();
    }
  }

  async function submit(values: WarrantyActivationRequestCreateFormValues) {
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
    provinces,
    provincesQuery,
    mutationIsPending: createMutation.isPending,
    onSubmit: form.handleSubmit(submit),
    productSearch: productSearchState.value,
    products,
    productsQuery,
    provinceCode,
    register: form.register,
    selectedCustomer,
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectedActivationProducts,
    selectCategory,
    selectCustomer,
    selectDealer,
    selectProduct,
    selectActivationProduct,
    selectProvince,
    selectWard,
    clearProduct,
    clearActivationProduct,
    setCustomerSearch,
    setDealerSearch,
    setProductSearch,
    wardCode,
    wards,
    wardsQuery,
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
