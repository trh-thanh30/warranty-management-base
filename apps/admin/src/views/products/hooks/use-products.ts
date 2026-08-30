"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AssignProductOwnerBody,
  AttachProductAssetBody,
  CreateProductBody,
  ListActivationProductOptionsQuery,
  ListProductsQuery,
  PaginatedResponse,
  ProductResponse,
  UpdateProductBody,
} from "@repo/shared";
import { productsService } from "@/src/services/products/products.service";
import type {
  ConfirmProductImportBody,
  ProductImportConfirmResult,
  ProductImportPreview,
} from "@/src/services/products/products.types";

export const productKeys = {
  all: ["products"] as const,
  detail: (productId: string | null) =>
    [...productKeys.details(), productId] as const,
  details: () => [...productKeys.all, "detail"] as const,
  list: (query: ListProductsQuery) => [...productKeys.lists(), query] as const,
  lists: () => [...productKeys.all, "list"] as const,
  activationOptions: (query: ListActivationProductOptionsQuery) =>
    [...productKeys.all, "activation-options", query] as const,
};

export function useInfiniteActivationProductOptions(
  query: Omit<ListActivationProductOptionsQuery, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    ...options,
    queryKey: productKeys.activationOptions(query),
    queryFn: ({ pageParam }) =>
      productsService.listActivationProductOptions({
        ...query,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useProducts(
  query: ListProductsQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ProductResponse>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: productKeys.list(query),
    queryFn: () => productsService.listProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteProducts(
  query: Omit<ListProductsQuery, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    ...options,
    queryKey: [...productKeys.lists(), "infinite", query] as const,
    queryFn: ({ pageParam }) =>
      productsService.listProducts({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useProduct(
  productId: string | null,
  options?: Pick<UseQueryOptions<ProductResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: productKeys.detail(productId),
    queryFn: () => productsService.getProduct(productId ?? ""),
  });
}

export function useProductCloneDraft(
  productId: string | null,
  options?: Pick<UseQueryOptions<ProductResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: [...productKeys.detail(productId), "clone"],
    queryFn: () => productsService.getProductCloneDraft(productId ?? ""),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductBody) =>
      productsService.createProduct(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct(productId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProductBody) =>
      productsService.updateProduct(productId ?? "", body),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.deleteProduct(productId),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      productsService.restoreProduct(productId),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
    },
  });
}

export function usePreviewProductImport() {
  return useMutation<ProductImportPreview, Error, File>({
    mutationFn: (file) => productsService.previewImport(file),
  });
}

export function useConfirmProductImport() {
  const queryClient = useQueryClient();

  return useMutation<
    ProductImportConfirmResult,
    Error,
    ConfirmProductImportBody
  >({
    mutationFn: (body) => productsService.confirmImport(body),
    onSuccess: (result) => {
      if (result.errors.length === 0) {
        void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      }
    },
  });
}

export function useAssignProductOwner(productId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AssignProductOwnerBody) =>
      productsService.assignOwner(productId ?? "", body),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
    },
  });
}

export function useAttachProductAsset(productId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AttachProductAssetBody) =>
      productsService.attachAsset(productId ?? "", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useRemoveProductAsset(productId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productAssetId: string) =>
      productsService.removeAsset(productId ?? "", productAssetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
