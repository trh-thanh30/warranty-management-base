"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type {
  CreateDealerBody,
  DealerResponse,
  UpdateDealerBody,
} from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { useCreateDealer, useUpdateDealer } from "@/src/hooks/use-dealers";
import { useToast } from "@/src/hooks/use-toast";
import { toOptionalValue } from "@/src/utils";
import { dealerFormSchema, type DealerFormValues } from "../dealers.types";

export function useDealerForm({
  dealer,
  onSaved,
}: {
  dealer: DealerResponse | null;
  onSaved: () => void;
}) {
  const t = useTranslations("Dealers");
  const toast = useToast();
  const creating = !dealer;
  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer(dealer?.id ?? null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<DealerFormValues>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: getDefaultValues(null),
  });

  useEffect(() => {
    reset(getDefaultValues(dealer));
  }, [dealer, reset]);

  async function submit(values: DealerFormValues) {
    try {
      if (creating) {
        await createDealer.mutateAsync(toCreateBody(values));
        toast.success(t("created"));
        onSaved();
        return;
      }

      await updateDealer.mutateAsync(toUpdateBody(values));
      toast.success(t("updated"));
      onSaved();
    } catch (error) {
      if (
        error instanceof HttpClientError &&
        error.message === "Dealer phone already exists"
      ) {
        setError("phone", { message: "phoneExists" });
        toast.error(t("phoneExists"));
        return;
      }

      const message =
        error instanceof HttpClientError ? error.message : t("saveError");
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
    selectedLatitude: watch("latitude"),
    selectedLongitude: watch("longitude"),
    selectedProvince: watch("province"),
    setValue,
  };
}

function getDefaultValues(dealer: DealerResponse | null): DealerFormValues {
  return {
    address: dealer?.address ?? "",
    district: dealer?.district ?? "",
    isActive: dealer?.isActive ?? true,
    latitude: dealer?.latitude ?? Number.NaN,
    longitude: dealer?.longitude ?? Number.NaN,
    name: dealer?.name ?? "",
    phone: dealer?.phone ?? "",
    province: dealer?.province ?? "",
    salesName: dealer?.salesName ?? "",
  };
}

function toCreateBody(values: DealerFormValues): CreateDealerBody {
  return {
    address: values.address.trim(),
    name: values.name.trim(),
    phone: toOptionalValue(values.phone),
    province: values.province.trim(),
    district: toOptionalValue(values.district),
    latitude: values.latitude,
    longitude: values.longitude,
    salesName: toOptionalValue(values.salesName),
  };
}

function toUpdateBody(values: DealerFormValues): UpdateDealerBody {
  return {
    ...toCreateBody(values),
    isActive: values.isActive,
  };
}
