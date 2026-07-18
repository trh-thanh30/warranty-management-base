"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreateServiceCenterBody,
  ListServiceCentersQuery,
  PaginatedResponse,
  ServiceCenterSummary,
  UpdateServiceCenterBody,
} from "@repo/shared";
import { serviceCentersService } from "@/src/services/service-centers/service-centers.service";

export const serviceCenterKeys = {
  all: ["service-centers"] as const,
  detail: (serviceCenterId: string | null) =>
    [...serviceCenterKeys.details(), serviceCenterId] as const,
  details: () => [...serviceCenterKeys.all, "detail"] as const,
  list: (query: ListServiceCentersQuery) =>
    [...serviceCenterKeys.lists(), query] as const,
  lists: () => [...serviceCenterKeys.all, "list"] as const,
  provinces: () => [...serviceCenterKeys.all, "provinces"] as const,
};

export function useServiceCenterProvinces(
  options?: Pick<UseQueryOptions<string[]>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: serviceCenterKeys.provinces(),
    queryFn: () => serviceCentersService.listProvinces(),
  });
}

export function useServiceCenters(
  query: ListServiceCentersQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ServiceCenterSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: serviceCenterKeys.list(query),
    queryFn: () => serviceCentersService.listServiceCenters(query),
    placeholderData: keepPreviousData,
  });
}

export function useActiveServiceCenters(
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ServiceCenterSummary>>,
    "enabled"
  >,
) {
  return useServiceCenters(
    {
      isActive: "true",
      limit: 100,
      page: 1,
      sortBy: "name",
      sortOrder: "asc",
    },
    options,
  );
}

export function useServiceCenter(
  serviceCenterId: string | null,
  options?: Pick<UseQueryOptions<ServiceCenterSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: serviceCenterKeys.detail(serviceCenterId),
    queryFn: () =>
      serviceCentersService.getServiceCenter(serviceCenterId ?? ""),
  });
}

export function useCreateServiceCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateServiceCenterBody) =>
      serviceCentersService.createServiceCenter(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: serviceCenterKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: serviceCenterKeys.provinces(),
      });
    },
  });
}

export function useUpdateServiceCenter(serviceCenterId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateServiceCenterBody) =>
      serviceCentersService.updateServiceCenter(serviceCenterId ?? "", body),
    onSuccess: (serviceCenter) => {
      void queryClient.invalidateQueries({
        queryKey: serviceCenterKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: serviceCenterKeys.provinces(),
      });
      queryClient.setQueryData(
        serviceCenterKeys.detail(serviceCenter.id),
        serviceCenter,
      );
    },
  });
}

export function useDeactivateServiceCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceCenterId: string) =>
      serviceCentersService.deactivateServiceCenter(serviceCenterId),
    onSuccess: (serviceCenter) => {
      void queryClient.invalidateQueries({
        queryKey: serviceCenterKeys.lists(),
      });
      queryClient.setQueryData(
        serviceCenterKeys.detail(serviceCenter.id),
        serviceCenter,
      );
    },
  });
}
