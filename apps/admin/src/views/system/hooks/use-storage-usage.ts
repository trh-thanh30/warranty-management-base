"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { StorageUsageSummary } from "@repo/shared";
import { assetsService } from "@/src/services/assets/assets.service";

export const storageUsageQueryKey = ["assets", "storage-usage"] as const;

export function useStorageUsage(
  options?: Pick<UseQueryOptions<StorageUsageSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryFn: () => assetsService.getStorageUsage(),
    queryKey: storageUsageQueryKey,
    staleTime: 60_000,
  });
}
