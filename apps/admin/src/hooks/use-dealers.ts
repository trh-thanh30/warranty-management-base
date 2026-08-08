"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreateDealerBody,
  DealerResponse,
  DealerActivatedCustomerSummary,
  ListDealerActivatedCustomersQuery,
  ListDealersQuery,
  PaginatedResponse,
  UpdateDealerBody,
} from "@repo/shared";
import { dealersService } from "@/src/services/dealers/dealers.service";

export const dealerKeys = {
  all: ["dealers"] as const,
  detail: (dealerId: string | null) =>
    [...dealerKeys.details(), dealerId] as const,
  details: () => [...dealerKeys.all, "detail"] as const,
  list: (query: ListDealersQuery) => [...dealerKeys.lists(), query] as const,
  lists: () => [...dealerKeys.all, "list"] as const,
  provinces: () => [...dealerKeys.all, "provinces"] as const,
  activatedCustomers: (
    dealerId: string,
    query: ListDealerActivatedCustomersQuery,
  ) => [...dealerKeys.all, "activated-customers", dealerId, query] as const,
};

export function useDealerActivatedCustomers(
  dealerId: string,
  query: ListDealerActivatedCustomersQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<DealerActivatedCustomerSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: dealerKeys.activatedCustomers(dealerId, query),
    queryFn: () => dealersService.listActivatedCustomers(dealerId, query),
    placeholderData: keepPreviousData,
  });
}

export function useDealers(
  query: ListDealersQuery,
  options?: Pick<UseQueryOptions<PaginatedResponse<DealerResponse>>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: dealerKeys.list(query),
    queryFn: () => dealersService.listDealers(query),
    placeholderData: keepPreviousData,
  });
}

export function useDealerProvinces(
  options?: Pick<UseQueryOptions<string[]>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: dealerKeys.provinces(),
    queryFn: () => dealersService.listProvinces(),
  });
}

export function useDealer(
  dealerId: string | null,
  options?: Pick<UseQueryOptions<DealerResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: dealerKeys.detail(dealerId),
    queryFn: () => dealersService.getDealer(dealerId ?? ""),
  });
}

export function useCreateDealer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDealerBody) => dealersService.createDealer(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealerKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dealerKeys.provinces() });
    },
  });
}

export function useUpdateDealer(dealerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateDealerBody) =>
      dealersService.updateDealer(dealerId ?? "", body),
    onSuccess: (dealer) => {
      void queryClient.invalidateQueries({ queryKey: dealerKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dealerKeys.provinces() });
      queryClient.setQueryData(dealerKeys.detail(dealer.id), dealer);
    },
  });
}

export function useDeactivateDealer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealerId: string) => dealersService.deactivateDealer(dealerId),
    onSuccess: (dealer) => {
      void queryClient.invalidateQueries({ queryKey: dealerKeys.lists() });
      queryClient.setQueryData(dealerKeys.detail(dealer.id), dealer);
    },
  });
}

export function useImportDealers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => dealersService.importDealers(file),
    onSuccess: (result) => {
      if (result.errors.length === 0) {
        void queryClient.invalidateQueries({ queryKey: dealerKeys.lists() });
        void queryClient.invalidateQueries({
          queryKey: dealerKeys.provinces(),
        });
      }
    },
  });
}
