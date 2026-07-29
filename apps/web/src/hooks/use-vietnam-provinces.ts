"use client";

import { useQuery } from "@tanstack/react-query";
import { locationsService } from "@/src/services/locations/locations.service";

const VIETNAM_PROVINCES_QUERY_KEY = [
  "locations",
  "vietnam",
  "provinces",
] as const;

type UseVietnamProvincesOptions = {
  enabled?: boolean;
};

const vietnamWardsQueryKey = (provinceCode: number | null) =>
  ["locations", "vietnam", "wards", provinceCode] as const;

export function useVietnamProvinces({
  enabled = true,
}: UseVietnamProvincesOptions = {}) {
  const query = useQuery({
    enabled,
    queryFn: () => locationsService.listVietnamProvinces(),
    queryKey: VIETNAM_PROVINCES_QUERY_KEY,
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}

export function useVietnamWards(
  provinceCode: number | null,
  { enabled = true }: UseVietnamProvincesOptions = {},
) {
  const query = useQuery({
    enabled: Boolean(provinceCode) && enabled,
    queryFn: () => locationsService.listVietnamWards(provinceCode ?? 0),
    queryKey: vietnamWardsQueryKey(provinceCode),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
