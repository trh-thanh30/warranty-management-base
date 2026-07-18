"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  ActivateWarrantyBody,
  ActivateWarrantyByCodeBody,
  ListWarrantiesQuery,
  PaginatedResponse,
  WarrantyListItem,
} from "@repo/shared";
import { warrantiesService } from "@/src/services/warranties/warranties.service";

export const warrantyKeys = {
  all: ["warranties"] as const,
  list: (query: ListWarrantiesQuery) =>
    [...warrantyKeys.lists(), query] as const,
  lists: () => [...warrantyKeys.all, "list"] as const,
};

export function useWarranties(
  query: ListWarrantiesQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<WarrantyListItem>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: warrantyKeys.list(query),
    queryFn: () => warrantiesService.listWarranties(query),
    placeholderData: keepPreviousData,
  });
}

export function useActivateWarrantyByCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ActivateWarrantyByCodeBody) =>
      warrantiesService.activateWarrantyByCode(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useActivateWarranty(productId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ActivateWarrantyBody) =>
      warrantiesService.activateWarranty(productId ?? "", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
