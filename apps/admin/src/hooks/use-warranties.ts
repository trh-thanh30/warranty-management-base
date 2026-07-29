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
  ManualWarrantyActivationBody,
  PaginatedResponse,
  WarrantyListItem,
  UpdateWarrantyBody,
  VoidWarrantyBody,
} from "@repo/shared";
import { warrantiesService } from "@/src/services/warranties/warranties.service";

export const warrantyKeys = {
  all: ["warranties"] as const,
  detail: (warrantyId: string | null) =>
    [...warrantyKeys.details(), warrantyId] as const,
  details: () => [...warrantyKeys.all, "detail"] as const,
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

export function useWarrantyDetail(
  warrantyId: string | null,
  options?: Pick<UseQueryOptions<WarrantyListItem>, "enabled">,
) {
  return useQuery({
    ...options,
    enabled: Boolean(warrantyId) && (options?.enabled ?? true),
    queryKey: warrantyKeys.detail(warrantyId),
    queryFn: () => warrantiesService.getWarrantyDetail(warrantyId ?? ""),
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

export function useActivateWarranty(warrantyId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ActivateWarrantyBody) =>
      warrantiesService.activateWarranty(warrantyId ?? "", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useVoidWarranty(warrantyId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VoidWarrantyBody) =>
      warrantiesService.voidWarranty(warrantyId ?? "", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({
        queryKey: ["warranty-activation-requests"],
      });
    },
  });
}

export function useUpdateWarranty(warrantyId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateWarrantyBody) =>
      warrantiesService.updateWarranty(warrantyId ?? "", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useManualWarrantyActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ManualWarrantyActivationBody) =>
      warrantiesService.manualActivation(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
