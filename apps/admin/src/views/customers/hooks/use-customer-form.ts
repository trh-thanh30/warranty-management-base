"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, type UseFormSetError } from "react-hook-form";
import {
  HttpClientError,
  type CreateCustomerBody,
  type CustomerSummary,
  type UpdateCustomerBody,
} from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "../customers.types";
import { buildCustomerAddress } from "../customers.utils";
import { useCreateCustomer, useUpdateCustomer } from "./use-customers";
import { toOptionalValue, toRequiredValue } from "@/src/utils";

export function useCustomerForm({
  customer,
  onSaved,
}: {
  customer: CustomerSummary | null;
  onSaved: (customer?: CustomerSummary) => void;
}) {
  const t = useTranslations("Customers");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const creating = !customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id ?? null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: getDefaultValues(null),
  });

  useEffect(() => {
    reset(getDefaultValues(customer));
  }, [customer, reset]);

  async function submit(values: CustomerFormValues) {
    try {
      if (creating) {
        const createdCustomer = await createCustomer.mutateAsync(
          toCreateCustomerBody(values),
        );
        toast.success(t("created"));
        onSaved(createdCustomer);
        return;
      }

      const updatedCustomer = await updateCustomer.mutateAsync(
        toUpdateCustomerBody(values),
      );
      toast.success(t("updated"));
      onSaved(updatedCustomer);
    } catch (error) {
      const handledMessage = handleCustomerSaveError(error, setError, t);
      if (handledMessage) {
        toast.error(handledMessage);
        return;
      }

      const message = getLocalizedApiError(error, t, { apiErrors: tApiErrors });
      setError("root", { message });
      toast.error(message);
    }
  }

  return {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit: handleSubmit(submit),
    register,
    setValue,
    watch,
  };
}

function getDefaultValues(
  customer: CustomerSummary | null,
): CustomerFormValues {
  return {
    address: customer?.address ?? "",
    addressDetail: customer?.address ?? "",
    customerCode: customer?.customerCode ?? "",
    email: customer?.email ?? "",
    fullName: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
  };
}

function toCreateCustomerBody(values: CustomerFormValues): CreateCustomerBody {
  return {
    address: buildCustomerAddress(values),
    customerCode: toOptionalValue(values.customerCode)?.toUpperCase(),
    email: toRequiredValue(values.email),
    fullName: values.fullName.trim(),
    phone: toRequiredValue(values.phone),
  };
}

function toUpdateCustomerBody(values: CustomerFormValues): UpdateCustomerBody {
  return {
    address: buildCustomerAddress(values),
    email: toRequiredValue(values.email),
    fullName: values.fullName.trim(),
    phone: toRequiredValue(values.phone),
  };
}

function handleCustomerSaveError(
  error: unknown,
  setError: UseFormSetError<CustomerFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return null;

  const messages = {
    "Customer code already exists": ["customerCode", "duplicateCustomerCode"],
    "Customer phone already exists": ["phone", "duplicatePhone"],
    "Customer email already exists": ["email", "duplicateEmail"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
