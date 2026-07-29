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
