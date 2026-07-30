"use client";

import { useQuery } from "@tanstack/react-query";
import { locationsService } from "@/src/services/locations/locations.service";

export function useVietnamWards(provinceCode: number | null) {
  const query = useQuery({
    enabled: Boolean(provinceCode),
    queryFn: () => locationsService.listVietnamWards(provinceCode ?? 0),
    queryKey: ["locations", "vietnam", "wards", provinceCode],
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
