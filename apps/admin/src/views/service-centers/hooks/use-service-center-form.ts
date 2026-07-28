"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type {
  CreateServiceCenterBody,
  ServiceCenterSummary,
  UpdateServiceCenterBody,
} from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import {
  useCreateServiceCenter,
  useUpdateServiceCenter,
} from "@/src/hooks/use-service-centers";
import {
  serviceCenterFormSchema,
  type ServiceCenterFormValues,
} from "../service-centers.types";
import { toOptionalValue } from "@/src/utils";

export function useServiceCenterForm({
  onSaved,
  serviceCenter,
}: {
  onSaved: () => void;
  serviceCenter: ServiceCenterSummary | null;
}) {
  const t = useTranslations("ServiceCenters");
  const toast = useToast();
  const creating = !serviceCenter;
  const createServiceCenter = useCreateServiceCenter();
  const updateServiceCenter = useUpdateServiceCenter(serviceCenter?.id ?? null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<ServiceCenterFormValues>({
    resolver: zodResolver(serviceCenterFormSchema),
    defaultValues: getDefaultValues(null),
  });

  useEffect(() => {
    reset(getDefaultValues(serviceCenter));
  }, [reset, serviceCenter]);

  async function submit(values: ServiceCenterFormValues) {
    try {
      if (creating) {
        await createServiceCenter.mutateAsync(toCreateBody(values));
        toast.success(t("created"));
        onSaved();
        return;
      }

      await updateServiceCenter.mutateAsync(toUpdateBody(values));
      toast.success(t("updated"));
      onSaved();
    } catch (error) {
      if (
        error instanceof HttpClientError &&
        error.message === "Service center phone already exists"
      ) {
        setError("phone", { message: "phoneExists" });
        toast.error(t("phoneExists"));
        return;
      }

      if (
        error instanceof HttpClientError &&
        error.message === "Service center email already exists"
      ) {
        setError("email", { message: "emailExists" });
        toast.error(t("emailExists"));
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
    selectedAddress: watch("address"),
    selectedDistrict: watch("district"),
    selectedLatitude: watch("latitude"),
    selectedLongitude: watch("longitude"),
    selectedProvince: watch("province"),
    setValue,
  };
}

function getDefaultValues(
  serviceCenter: ServiceCenterSummary | null,
): ServiceCenterFormValues {
  return {
    address: serviceCenter?.address ?? "",
    district: serviceCenter?.district ?? "",
    email: serviceCenter?.email ?? "",
    isActive: serviceCenter?.isActive ?? true,
    latitude: serviceCenter?.latitude ?? Number.NaN,
    longitude: serviceCenter?.longitude ?? Number.NaN,
    name: serviceCenter?.name ?? "",
    phone: serviceCenter?.phone ?? "",
    province: serviceCenter?.province ?? "",
  };
}

function toCreateBody(
  values: ServiceCenterFormValues,
): CreateServiceCenterBody {
  return {
    address: values.address.trim(),
    district: toOptionalValue(values.district),
    email: toOptionalValue(values.email),
    latitude: values.latitude,
    longitude: values.longitude,
    name: values.name.trim(),
    phone: toOptionalValue(values.phone),
    province: values.province.trim(),
  };
}

function toUpdateBody(
  values: ServiceCenterFormValues,
): UpdateServiceCenterBody {
  return {
    ...toCreateBody(values),
    isActive: values.isActive,
  };
}
