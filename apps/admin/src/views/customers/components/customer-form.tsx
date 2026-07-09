"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, type UseFormSetError } from "react-hook-form";
import {
  HttpClientError,
  type CreateCustomerBody,
  type CustomerSummary,
  type UpdateCustomerBody,
} from "@repo/shared";
import { Button, Input, Label, Textarea } from "@repo/ui";
import { useToast } from "@/src/hooks/use-toast";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "../customers.types";
import { useCreateCustomer, useUpdateCustomer } from "../use-customers";

type CustomerFormProps = {
  customer: CustomerSummary | null;
  onCancel: () => void;
  onSaved: () => void;
};

export function CustomerForm({
  customer,
  onCancel,
  onSaved,
}: CustomerFormProps) {
  const t = useTranslations("Customers");
  const toast = useToast();
  const creating = !customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id ?? null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
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
        await createCustomer.mutateAsync(toCreateCustomerBody(values));
        toast.success(t("created"));
        onSaved();
        return;
      }

      await updateCustomer.mutateAsync(toUpdateCustomerBody(values));
      toast.success(t("updated"));
      onSaved();
    } catch (error) {
      const handledMessage = handleCustomerSaveError(error, setError, t);
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

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(submit)}>
      {errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.fullName?.message, t)}
          id="customer-full-name"
          label={t("fullName")}
        >
          <Input
            autoComplete="name"
            id="customer-full-name"
            placeholder={t("fullNamePlaceholder")}
            {...register("fullName")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.customerCode?.message, t)}
          id="customer-code"
          label={t("customerCode")}
        >
          <Input
            autoComplete="off"
            disabled={!creating}
            id="customer-code"
            placeholder={
              creating
                ? t("customerCodeAutoPlaceholder")
                : t("customerCodePlaceholder")
            }
            {...register("customerCode")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.phone?.message, t)}
          id="customer-phone"
          label={t("phone")}
        >
          <Input
            autoComplete="tel"
            id="customer-phone"
            placeholder={t("phonePlaceholder")}
            type="tel"
            {...register("phone")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.email?.message, t)}
          id="customer-email"
          label={t("email")}
        >
          <Input
            autoComplete="email"
            id="customer-email"
            placeholder={t("emailPlaceholder")}
            type="email"
            {...register("email")}
          />
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.address?.message, t)}
        id="customer-address"
        label={t("address")}
      >
        <Textarea
          id="customer-address"
          placeholder={t("addressPlaceholder")}
          rows={4}
          {...register("address")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {t("cancel")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {creating ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function getDefaultValues(
  customer: CustomerSummary | null,
): CustomerFormValues {
  return {
    address: customer?.address ?? "",
    customerCode: customer?.customerCode ?? "",
    email: customer?.email ?? "",
    fullName: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
  };
}

function toCreateCustomerBody(values: CustomerFormValues): CreateCustomerBody {
  return {
    address: toRequiredValue(values.address),
    customerCode: toOptionalValue(values.customerCode)?.toUpperCase(),
    email: toRequiredValue(values.email),
    fullName: values.fullName.trim(),
    phone: toRequiredValue(values.phone),
  };
}

function toUpdateCustomerBody(values: CustomerFormValues): UpdateCustomerBody {
  return {
    address: toRequiredValue(values.address),
    email: toRequiredValue(values.email),
    fullName: values.fullName.trim(),
    phone: toRequiredValue(values.phone),
  };
}

function toOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function toRequiredValue(value: string) {
  const trimmed = value.trim();
  return trimmed;
}

function handleCustomerSaveError(
  error: unknown,
  setError: UseFormSetError<CustomerFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) {
    return null;
  }

  if (error.message === "Customer code already exists") {
    const message = t("duplicateCustomerCode");
    setError("customerCode", { message });
    return message;
  }

  if (error.message === "Customer phone already exists") {
    const message = t("duplicatePhone");
    setError("phone", { message });
    return message;
  }

  if (error.message === "Customer email already exists") {
    const message = t("duplicateEmail");
    setError("email", { message });
    return message;
  }

  return null;
}

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "customerCodeLength",
    "addressRequired",
    "emailInvalid",
    "emailRequired",
    "fullNameRequired",
    "phoneLength",
    "phoneRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
