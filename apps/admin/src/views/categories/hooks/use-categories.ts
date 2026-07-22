"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CategoryResponse,
  CreateCategoryBody,
  ListCategoriesQuery,
  PaginatedResponse,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@repo/shared";
import { categoriesService } from "@/src/services/categories/categories.service";

export const categoryKeys = {
  all: ["categories"] as const,
  detail: (categoryId: string | null) =>
    [...categoryKeys.details(), categoryId] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  list: (query: ListCategoriesQuery) =>
    [...categoryKeys.lists(), query] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

export function useCategories(
  query: ListCategoriesQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<CategoryResponse>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: categoryKeys.list(query),
    queryFn: () => categoriesService.listCategories(query),
    placeholderData: keepPreviousData,
  });
}

export function useCategory(
  categoryId: string | null,
  options?: Pick<UseQueryOptions<CategoryResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoriesService.getCategory(categoryId ?? ""),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryBody) =>
      categoriesService.createCategory(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory(categoryId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCategoryBody) =>
      categoriesService.updateCategory(categoryId ?? "", body),
    onSuccess: (category) => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.setQueryData(categoryKeys.detail(category.id), category);
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoriesService.deactivateCategory(categoryId),
    onSuccess: (category) => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.setQueryData(categoryKeys.detail(category.id), category);
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReorderCategoriesBody) =>
      categoriesService.reorderCategories(body),
    onSuccess: (categories) => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      for (const category of categories) {
        queryClient.setQueryData(categoryKeys.detail(category.id), category);
      }
    },
  });
}

export function useImportCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => categoriesService.importCategories(file),
    onSuccess: (result) => {
      if (result.errors.length === 0) {
        void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      }
    },
  });
}
