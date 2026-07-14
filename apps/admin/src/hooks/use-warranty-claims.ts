"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AssignWarrantyClaimServiceCenterBody,
  ListWarrantyClaimsQuery,
  PaginatedResponse,
  ServiceCenterSummary,
  UpdateWarrantyClaimPriorityBody,
  UpdateWarrantyClaimStatusBody,
  WarrantyClaimMetrics,
  WarrantyClaimMetricsQuery,
  WarrantyClaimSummary,
  WarrantyClaimTimelineItem,
} from "@repo/shared";
import { warrantyClaimsService } from "@/src/services/warranty-claims/warranty-claims.service";

export const warrantyClaimKeys = {
  all: ["warranty-claims"] as const,
  detail: (claimId: string | null) =>
    [...warrantyClaimKeys.details(), claimId] as const,
  details: () => [...warrantyClaimKeys.all, "detail"] as const,
  list: (query: ListWarrantyClaimsQuery) =>
    [...warrantyClaimKeys.lists(), query] as const,
  lists: () => [...warrantyClaimKeys.all, "list"] as const,
  metrics: (query: WarrantyClaimMetricsQuery) =>
    [...warrantyClaimKeys.all, "metrics", query] as const,
  serviceCenters: () => [...warrantyClaimKeys.all, "service-centers"] as const,
  timeline: (claimId: string | null) =>
    [...warrantyClaimKeys.detail(claimId), "timeline"] as const,
};

export function useWarrantyClaims(
  query: ListWarrantyClaimsQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<WarrantyClaimSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: warrantyClaimKeys.list(query),
    queryFn: () => warrantyClaimsService.listWarrantyClaims(query),
  });
}

export function useWarrantyClaim(
  claimId: string | null,
  options?: Pick<UseQueryOptions<WarrantyClaimSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: warrantyClaimKeys.detail(claimId),
    queryFn: () => warrantyClaimsService.getWarrantyClaim(claimId ?? ""),
  });
}

export function useWarrantyClaimTimeline(
  claimId: string | null,
  options?: Pick<UseQueryOptions<WarrantyClaimTimelineItem[]>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: warrantyClaimKeys.timeline(claimId),
    queryFn: () =>
      warrantyClaimsService.getWarrantyClaimTimeline(claimId ?? ""),
  });
}

export function useWarrantyClaimMetrics(
  query: WarrantyClaimMetricsQuery,
  options?: Pick<UseQueryOptions<WarrantyClaimMetrics>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: warrantyClaimKeys.metrics(query),
    queryFn: () => warrantyClaimsService.getMetrics(query),
  });
}

export function useActiveServiceCenters(
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ServiceCenterSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: warrantyClaimKeys.serviceCenters(),
    queryFn: () => warrantyClaimsService.listActiveServiceCenters(),
  });
}

export function useUpdateWarrantyClaimStatus(claimId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateWarrantyClaimStatusBody) =>
      warrantyClaimsService.updateStatus(claimId ?? "", body),
    onSuccess: (claim) => {
      void queryClient.invalidateQueries({ queryKey: warrantyClaimKeys.all });
      queryClient.setQueryData(warrantyClaimKeys.detail(claim.id), claim);
    },
  });
}

export function useAssignWarrantyClaimServiceCenter(claimId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AssignWarrantyClaimServiceCenterBody) =>
      warrantyClaimsService.assignServiceCenter(claimId ?? "", body),
    onSuccess: (claim) => {
      void queryClient.invalidateQueries({ queryKey: warrantyClaimKeys.all });
      queryClient.setQueryData(warrantyClaimKeys.detail(claim.id), claim);
    },
  });
}

export function useUpdateWarrantyClaimPriority(claimId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateWarrantyClaimPriorityBody) =>
      warrantyClaimsService.updatePriority(claimId ?? "", body),
    onSuccess: (claim) => {
      void queryClient.invalidateQueries({ queryKey: warrantyClaimKeys.all });
      queryClient.setQueryData(warrantyClaimKeys.detail(claim.id), claim);
    },
  });
}
