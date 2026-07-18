"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import { locationsService } from "@/src/services/locations/locations.service";

export const locationKeys = {
  all: ["locations"] as const,
  vietnam: () => [...locationKeys.all, "vietnam"] as const,
  vietnamProvinces: () => [...locationKeys.vietnam(), "provinces"] as const,
  vietnamWards: (provinceCode: number | null) =>
    [...locationKeys.vietnam(), "wards", provinceCode] as const,
};

export function useVietnamProvinces(
  options?: Pick<UseQueryOptions<VietnamProvince[]>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: locationKeys.vietnamProvinces(),
    queryFn: () => locationsService.listVietnamProvinces(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useVietnamWards(
  provinceCode: number | null,
  options?: Pick<UseQueryOptions<VietnamWard[]>, "enabled">,
) {
  return useQuery({
    ...options,
    enabled: Boolean(provinceCode) && (options?.enabled ?? true),
    queryKey: locationKeys.vietnamWards(provinceCode),
    queryFn: () => locationsService.listVietnamWards(provinceCode ?? 0),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
