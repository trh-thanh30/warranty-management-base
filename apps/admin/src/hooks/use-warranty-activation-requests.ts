"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreateAdminWarrantyActivationRequestBody,
  CreateWarrantyActivationRequestBody,
  ListWarrantyActivationRequestsQuery,
  PaginatedResponse,
  ReviewWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";

export const warrantyActivationRequestKeys = {
  all: ["warranty-activation-requests"] as const,
  detail: (requestId: string | null) =>
    [...warrantyActivationRequestKeys.details(), requestId] as const,
  details: () => [...warrantyActivationRequestKeys.all, "detail"] as const,
  list: (query: ListWarrantyActivationRequestsQuery) =>
    [...warrantyActivationRequestKeys.lists(), query] as const,
  lists: () => [...warrantyActivationRequestKeys.all, "list"] as const,
};

export function useWarrantyActivationRequests(
  query: ListWarrantyActivationRequestsQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<WarrantyActivationRequestSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: warrantyActivationRequestKeys.list(query),
    queryFn: () =>
      warrantyActivationRequestsService.listWarrantyActivationRequests(query),
    placeholderData: keepPreviousData,
  });
}

export function useWarrantyActivationRequest(
  requestId: string | null,
  options?: Pick<UseQueryOptions<WarrantyActivationRequestSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: warrantyActivationRequestKeys.detail(requestId),
    queryFn: () =>
      warrantyActivationRequestsService.getWarrantyActivationRequest(
        requestId ?? "",
      ),
  });
}

export function useCreateWarrantyActivationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateWarrantyActivationRequestBody) =>
      warrantyActivationRequestsService.createWarrantyActivationRequest(body),
    onSuccess: (request) => {
      void queryClient.invalidateQueries({
        queryKey: warrantyActivationRequestKeys.all,
      });
      queryClient.setQueryData(
        warrantyActivationRequestKeys.detail(request.id),
        request,
      );
    },
  });
}

export function useCreateAdminWarrantyActivationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminWarrantyActivationRequestBody) =>
      warrantyActivationRequestsService.createAdminWarrantyActivationRequest(
        body,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: warrantyActivationRequestKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useReviewWarrantyActivationRequest(requestId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReviewWarrantyActivationRequestBody) =>
      warrantyActivationRequestsService.reviewWarrantyActivationRequest(
        requestId ?? "",
        body,
      ),
    onSuccess: (request) => {
      void queryClient.invalidateQueries({
        queryKey: warrantyActivationRequestKeys.all,
      });
      queryClient.setQueryData(
        warrantyActivationRequestKeys.detail(request.id),
        request,
      );
    },
  });
}

export function useResendWarrantyActivationRequestCertificateEmail(
  requestId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      warrantyActivationRequestsService.resendWarrantyActivationRequestCertificateEmail(
        requestId ?? "",
      ),
    onSuccess: (request) => {
      void queryClient.invalidateQueries({
        queryKey: warrantyActivationRequestKeys.all,
      });
      queryClient.setQueryData(
        warrantyActivationRequestKeys.detail(request.id),
        request,
      );
    },
  });
}
