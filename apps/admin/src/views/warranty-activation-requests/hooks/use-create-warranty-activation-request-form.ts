"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryActivationFieldConfig,
  CustomerSummary,
  DealerResponse,
  ProductResponse,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { useTranslations } from "next-intl";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type UseFormSetValue } from "react-hook-form";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import { useToast } from "@/src/hooks/use-toast";
import {
  useCreateAdminWarrantyActivationRequest,
  useUpdateAdminWarrantyActivationRequest,
} from "@/src/hooks/use-warranty-activation-requests";
import { parseVietnamAddress } from "@/src/utils";
import { useDealer, useInfiniteDealers } from "@/src/hooks/use-dealers";
import {
  useCategories,
  useCategoryActivationFields,
} from "../../categories/hooks/use-categories";
import {
  useCustomer,
  useInfiniteCustomers,
} from "../../customers/hooks/use-customers";
import type { CustomerFormValues } from "../../customers/customers.types";
import { buildCustomerAddress } from "../../customers/customers.utils";
import { useInfiniteActivationProductOptions } from "../../products/hooks/use-products";
import { useProduct } from "../../products/hooks/use-products";
import { productKeys } from "../../products/hooks/use-products";
import { productsService } from "@/src/services/products/products.service";
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
  isActivationCodeRequiredForRequest,
} from "../warranty-activation-request-product.utils";
import { formatActivationRequestDateTimeInput } from "../warranty-activation-requests.utils";

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
  updateCustomerProfile: false,
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
  installedAt: formatActivationRequestDateTimeInput(new Date().toISOString()),
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
  onSaved,
  activationCodeId,
  assignedProductId,
  initialRequest,
}: {
  onSaved: () => void;
  activationCodeId?: string;
  assignedProductId?: string;
  initialRequest?: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const createMutation = useCreateAdminWarrantyActivationRequest();
  const updateMutation = useUpdateAdminWarrantyActivationRequest(
    initialRequest?.id ?? null,
  );
  const hasHydratedEditRequest = useRef(false);
  const [isHydratingEditRequest, setIsHydratingEditRequest] = useState(
    Boolean(initialRequest),
  );
  const [activationCodeSearch, setActivationCodeSearch] = useState("");
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
  const [selectedItemActivationCodes, setSelectedItemActivationCodes] =
    useState<Record<string, AvailableActivationCode>>({});
  const assignedProductQuery = useProduct(assignedProductId ?? null, {
    enabled: Boolean(assignedProductId),
  });
  const initialCustomerQuery = useCustomer(initialRequest?.customerId ?? null, {
    enabled: Boolean(initialRequest?.customerId),
  });
  const initialDealerQuery = useDealer(initialRequest?.dealerId ?? null, {
    enabled: Boolean(initialRequest?.dealerId),
  });
  const initialProductIds = useMemo(
    () =>
      Array.from(
        new Set(
          [
            initialRequest?.productId,
            ...(initialRequest?.items ?? []).map((item) => item.productId),
          ].filter((id): id is string => Boolean(id)),
        ),
      ),
    [initialRequest],
  );
  const initialProductQueries = useQueries({
    queries: initialProductIds.map((productId) => ({
      enabled: Boolean(initialRequest),
      queryFn: () => productsService.getProduct(productId),
      queryKey: productKeys.detail(productId),
    })),
  });
  const isEditHydrationError = Boolean(
    initialRequest &&
    ((initialRequest.customerId && initialCustomerQuery.isError) ||
      (initialRequest.dealerId && initialDealerQuery.isError) ||
      initialProductQueries.some((query) => query.isError)),
  );
  const showItemActivationCodeSelectors = Boolean(
    initialRequest?.items?.some((item) => item.activationCodeId),
  );
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
  const categoriesQuery = useCategories({
    isActive: "true",
    limit: 100,
    type: "PRODUCT",
  });
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items],
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const requiresActivationCode = isActivationCodeRequiredForRequest(
    selectedCategory?.activationCodeEnabled,
    selectedProduct?.categoryRef?.activationCodeEnabled,
  );
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const debouncedCustomerSearch = useDebounce(customerSearch.trim(), 300);
  const debouncedActivationCodeSearch = useDebounce(
    activationCodeSearch.trim(),
    300,
  );
  const debouncedProductSearch = useDebounce(productSearchState, 300);
  const productSearchQuery = resolveScopedProductSearch(
    categoryId,
    debouncedProductSearch,
  );
  const debouncedDealerSearch = useDebounce(dealerSearch.trim(), 300);
  const activationCodesQuery = useInfiniteQuery({
    enabled:
      !activationCodeId && Boolean(selectedProduct) && requiresActivationCode,
    queryKey: [
      "available-activation-codes",
      selectedProduct?.id ?? "all",
      debouncedActivationCodeSearch,
    ],
    queryFn: ({ pageParam }) =>
      activationCodesService.listAvailableByProduct(selectedProduct?.id, {
        assignment: "ASSIGNED",
        limit: 10,
        page: pageParam,
        search: debouncedActivationCodeSearch || undefined,
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
    if (!initialRequest || hasHydratedEditRequest.current) return;
    if (initialRequest.customerId && !initialCustomerQuery.data) return;
    if (initialRequest.dealerId && !initialDealerQuery.data) return;
    if (
      initialProductIds.length > 0 &&
      initialProductQueries.some((query) => !query.data)
    ) {
      return;
    }

    const productsById = new Map(
      initialProductQueries
        .map((query) => query.data)
        .filter((product): product is ProductResponse => Boolean(product))
        .map((product) => [product.id, product]),
    );
    const metadata = initialRequest.metadata ?? {};
    const activationInputValues = toStringRecord(
      metadata.activationInputValues,
    );
    const filmItems = toStringRecord(metadata.filmItems);
    const primaryProduct = initialRequest.productId
      ? (productsById.get(initialRequest.productId) ?? null)
      : (productsById.values().next().value ?? null);
    const activationProducts = Object.fromEntries(
      (initialRequest.items ?? []).flatMap((item) => {
        const product = productsById.get(item.productId);
        return product ? [[item.positionKey, product] as const] : [];
      }),
    );
    const requestActivationCode = initialRequest.activationCode;
    const itemActivationCodes = Object.fromEntries(
      (initialRequest.items ?? []).flatMap((item) =>
        item.activationCode
          ? [
              [
                item.positionKey,
                {
                  assignedProduct: null,
                  batchCode: "",
                  batchName: "",
                  expiresAt: "",
                  id: item.activationCode.id,
                  maskedCode:
                    item.activationCode.code ?? item.activationCode.id,
                  productName: item.productName,
                  productSku: item.productCode,
                  selectable: true,
                  status: item.activationCode.status,
                } satisfies AvailableActivationCode,
              ] as const,
            ]
          : [],
      ),
    );

    form.reset({
      ...DEFAULT_VALUES,
      activationCodeId: requestActivationCode?.id ?? "",
      activationProductIds: Object.fromEntries(
        Object.entries(activationProducts).map(([key, product]) => [
          key,
          product.id,
        ]),
      ),
      addressDetail: initialRequest.addressDetail,
      categoryId: initialRequest.categoryId ?? "",
      categoryInputValues: activationInputValues,
      customerBirthdate: initialRequest.customerBirthdate?.slice(0, 10) ?? "",
      customerEmail: initialRequest.customerEmail ?? "",
      customerId: initialRequest.customerId ?? "",
      customerName: initialRequest.customerName,
      customerPhone: initialRequest.customerPhone,
      dealerAddress: initialRequest.dealer?.address ?? "",
      dealerDistrict: initialRequest.dealer?.district ?? "",
      dealerId: initialRequest.dealerId ?? "",
      dealerName: initialRequest.dealer?.name ?? "",
      dealerPhone: initialRequest.dealer?.phone ?? "",
      dealerProvince: initialRequest.dealer?.province ?? "",
      filmFrontLeftSide: filmItems.frontLeftSide ?? "",
      filmFrontRightSide: filmItems.frontRightSide ?? "",
      filmRearGlass: filmItems.rearGlass ?? "",
      filmRearLeftSide: filmItems.rearLeftSide ?? "",
      filmRearRightSide: filmItems.rearRightSide ?? "",
      filmSunroof: filmItems.sunroof ?? "",
      filmWindshield: filmItems.windshield ?? "",
      installedAt: formatActivationRequestDateTimeInput(
        initialRequest.installedAt,
      ),
      note: initialRequest.note ?? "",
      productId: primaryProduct?.id ?? initialRequest.productId ?? "",
      productName: initialRequest.productName ?? "",
      provinceCode: initialRequest.provinceCode,
      salesName: initialRequest.dealer?.salesName ?? "",
      vehicleModel: initialRequest.vehicleModel ?? "",
      vehiclePlate: initialRequest.vehiclePlate ?? "",
      wardCode: initialRequest.wardCode,
      warrantyCode: initialRequest.warrantyCode,
    });
    setSelectedCustomer(
      initialCustomerQuery.data
        ? {
            ...initialCustomerQuery.data,
            address: initialRequest.fullAddress || null,
            birthdate: initialRequest.customerBirthdate,
            email: initialRequest.customerEmail,
            fullName: initialRequest.customerName,
            phone: initialRequest.customerPhone,
          }
        : null,
    );
    setSelectedDealer(initialDealerQuery.data ?? null);
    setSelectedProduct(primaryProduct);
    setSelectedActivationProducts(activationProducts);
    setSelectedItemActivationCodes(itemActivationCodes);
    if (requestActivationCode) {
      setSelectedActivationCode({
        assignedProduct: null,
        batchCode: "",
        batchName: "",
        expiresAt: "",
        id: requestActivationCode.id,
        maskedCode: requestActivationCode.code ?? requestActivationCode.id,
        productName: initialRequest.productName ?? "",
        productSku: "",
        selectable: true,
        status: requestActivationCode.status,
      });
    }
    hasHydratedEditRequest.current = true;
    setIsHydratingEditRequest(false);
  }, [
    form,
    initialCustomerQuery.data,
    initialDealerQuery.data,
    initialProductIds.length,
    initialProductQueries,
    initialRequest,
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
        updateCustomerProfile: false,
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
        updateCustomerProfile: false,
        provinceCode: "",
        wardCode: "",
      },
      shouldValidate,
    );
  }

  function updateCustomerSnapshot(
    values: CustomerFormValues,
    updateCustomerProfile: boolean,
  ) {
    if (!selectedCustomer) return;

    const fullAddress = buildCustomerAddress(values);
    const parsedAddress = parseVietnamAddress(fullAddress, provinces);
    const customer = {
      ...selectedCustomer,
      address: fullAddress || null,
      birthdate: values.birthdate || null,
      email: values.email.trim() || null,
      fullName: values.fullName.trim(),
      phone: values.phone.trim() || null,
    };

    setSelectedCustomer(customer);
    setPendingWardName(null);
    form.clearErrors([
      "addressDetail",
      "customerEmail",
      "customerName",
      "customerPhone",
      "provinceCode",
      "wardCode",
    ]);
    setFormValues(form.setValue, {
      addressDetail: parsedAddress.detail,
      customerBirthdate: values.birthdate,
      customerEmail: values.email.trim(),
      customerName: values.fullName.trim(),
      customerPhone: values.phone.trim(),
      provinceCode: values.provinceCode,
      updateCustomerProfile,
      wardCode: values.wardCode,
    });
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

  function selectActivationCode(code: AvailableActivationCode) {
    setSelectedActivationCode(code);
    form.setValue("activationCodeId", code.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.clearErrors("activationCodeId");
  }

  function clearActivationCode() {
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
    setSelectedItemActivationCodes({});
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
    if (selectedActivationProducts[positionKey]?.id !== product.id) {
      clearItemActivationCode(positionKey);
    }

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
    clearItemActivationCode(positionKey);
  }

  function selectItemActivationCode(
    positionKey: string,
    code: AvailableActivationCode,
  ) {
    setSelectedItemActivationCodes((current) => ({
      ...current,
      [positionKey]: code,
    }));
  }

  function clearItemActivationCode(positionKey: string) {
    setSelectedItemActivationCodes((current) => {
      const next = { ...current };
      delete next[positionKey];
      return next;
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
    const selectedActivationCodeIds = Object.fromEntries(
      Object.entries(selectedItemActivationCodes).map(
        ([positionKey, code]) => [positionKey, code.id] as const,
      ),
    );
    const hasActivationCode = Boolean(
      values.activationCodeId ||
      activationCodeId ||
      Object.keys(selectedActivationCodeIds).length > 0,
    );

    if (requiresActivationCode && !hasActivationCode) {
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
      const body = toAdminActivationRequestBody({
        activationFields,
        activationCodeIdsByPosition: selectedActivationCodeIds,
        activationProducts: selectedActivationProducts,
        existingMetadata: initialRequest?.metadata,
        product: selectedProduct,
        provinces,
        values,
        wards,
      });
      if (initialRequest) {
        await updateMutation.mutateAsync(body);
        toast.success(t("updated"));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("created"));
      }
      onSaved();
    } catch (error) {
      const message = resolveActivationRequestCreateError(error, t, tApiErrors);
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    activationCodeSearch,
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
    isSaving:
      form.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    isHydratingEditRequest,
    isEditHydrationError,
    isActivationCodeSearchPending:
      activationCodeSearch.trim() !== debouncedActivationCodeSearch,
    loadMoreProducts,
    mutationIsPending: createMutation.isPending || updateMutation.isPending,
    onSubmit: form.handleSubmit(submit),
    productSearch: productSearchState.value,
    products,
    productsQuery,
    register: form.register,
    requiresActivationCode,
    selectedCustomer,
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectedActivationProducts,
    selectedItemActivationCodes,
    activationCodesQuery,
    availableActivationCodes,
    selectedActivationCode,
    updateCustomerProfile: form.watch("updateCustomerProfile"),
    confirmCategoryChange,
    cancelCategoryChange,
    selectCategory,
    selectCustomer,
    updateCustomerSnapshot,
    selectDealer,
    selectProduct,
    selectActivationCode,
    selectActivationProduct,
    selectItemActivationCode,
    clearProduct,
    clearActivationCode,
    clearActivationProduct,
    clearItemActivationCode,
    setCustomerSearch,
    setActivationCodeSearch,
    setDealerSearch,
    setProductSearch,
    usesProductSelectors,
    showItemActivationCodeSelectors,
    retryEditHydration: async () => {
      const retries: Promise<unknown>[] = [];
      if (initialCustomerQuery.isError)
        retries.push(initialCustomerQuery.refetch());
      if (initialDealerQuery.isError)
        retries.push(initialDealerQuery.refetch());
      for (const query of initialProductQueries) {
        if (query.isError) retries.push(query.refetch());
      }
      await Promise.all(retries);
    },
  };
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
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
