"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreateCustomerBody,
  CustomerSummary,
  ListCustomersQuery,
  PaginatedResponse,
  UpdateCustomerBody,
} from "@repo/shared";
import { customersService } from "@/src/services/customers/customers.service";

export const customerKeys = {
  all: ["customers"] as const,
  detail: (customerId: string | null) =>
    [...customerKeys.details(), customerId] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  list: (query: ListCustomersQuery) =>
    [...customerKeys.lists(), query] as const,
  lists: () => [...customerKeys.all, "list"] as const,
};

export function useCustomers(
  query: ListCustomersQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<CustomerSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    queryKey: customerKeys.list(query),
    queryFn: () => customersService.listCustomers(query),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useCustomer(
  customerId: string | null,
  options?: Pick<UseQueryOptions<CustomerSummary>, "enabled">,
) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => customersService.getCustomer(customerId ?? ""),
    ...options,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCustomerBody) =>
      customersService.createCustomer(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomer(customerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCustomerBody) =>
      customersService.updateCustomer(customerId ?? "", body),
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
    },
  });
}

export function useImportCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => customersService.importCustomers(file),
    onSuccess: (result) => {
      if (result.errors.length === 0) {
        void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      }
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) =>
      customersService.deleteCustomer(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) =>
      customersService.restoreCustomer(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
