"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@repo/hooks";
import type { CustomerSummary, ProductResponse } from "@repo/shared";
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
import { useCustomers } from "../../customers/hooks/use-customers";
import { useInfiniteProducts } from "../../products/hooks/use-products";
import {
  type WarrantyActivationRequestCreateFormValues,
  warrantyActivationRequestCreateFormSchema,
} from "../warranty-activation-requests.types";
import {
  resolveActivationRequestCreateError,
  toAdminActivationRequestBody,
} from "../warranty-activation-requests.utils";

const DEFAULT_VALUES: WarrantyActivationRequestCreateFormValues = {
  addressDetail: "",
  customerBirthdate: "",
  customerEmail: "",
  customerName: "",
  customerPhone: "",
  note: "",
  productId: "",
  productName: "",
  provinceCode: "",
  wardCode: "",
  warrantyCode: "",
};

export function useCreateWarrantyActivationRequestForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const toast = useToast();
  const createMutation = useCreateAdminWarrantyActivationRequest();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const form = useForm<WarrantyActivationRequestCreateFormValues>({
    resolver: zodResolver(warrantyActivationRequestCreateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const provinceCode = form.watch("provinceCode");
  const wardCode = form.watch("wardCode");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const debouncedCustomerSearch = useDebounce(customerSearch.trim(), 300);
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);
  const customersQuery = useCustomers({
    limit: 20,
    search: debouncedCustomerSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const productsQuery = useInfiniteProducts({
    limit: 20,
    search: debouncedProductSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });
  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data?.items],
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
      customerEmail: customer.email ?? "",
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

  function clearCustomer() {
    setSelectedCustomer(null);
    setPendingWardName(null);
    setFormValues(form.setValue, {
      addressDetail: "",
      customerBirthdate: "",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      provinceCode: "",
      wardCode: "",
    });
  }

  function selectProduct(product: ProductResponse) {
    setSelectedProduct(product);
    setProductSearch("");
    setFormValues(form.setValue, {
      productId: product.id,
      productName: product.name,
      warrantyCode: product.warrantyCode ?? "",
    });
  }

  function clearProduct() {
    setSelectedProduct(null);
    setFormValues(form.setValue, {
      productId: "",
      productName: "",
      warrantyCode: "",
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
    try {
      await createMutation.mutateAsync(
        toAdminActivationRequestBody({
          product: selectedProduct,
          provinces,
          values,
          wards,
        }),
      );
      toast.success(t("created"));
      onCreated();
    } catch (error) {
      const message = resolveActivationRequestCreateError(error, t);
      form.setError("root", { message });
      toast.error(message);
    }
  }

  return {
    clearCustomer,
    control: form.control,
    customerSearch,
    customers,
    customersQuery,
    errors: form.formState.errors,
    isSaving: form.formState.isSubmitting || createMutation.isPending,
    loadMoreProducts,
    provinces,
    provincesQuery,
    mutationIsPending: createMutation.isPending,
    onSubmit: form.handleSubmit(submit),
    productSearch,
    products,
    productsQuery,
    provinceCode,
    register: form.register,
    selectedCustomer,
    selectedProduct,
    selectCustomer,
    selectProduct,
    selectProvince,
    selectWard,
    clearProduct,
    setCustomerSearch,
    setProductSearch,
    wardCode,
    wards,
    wardsQuery,
  };
}

function setFormValues(
  setValue: UseFormSetValue<WarrantyActivationRequestCreateFormValues>,
  values: Partial<WarrantyActivationRequestCreateFormValues>,
) {
  for (const [field, value] of Object.entries(values)) {
    setValue(field as keyof WarrantyActivationRequestCreateFormValues, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }
}
