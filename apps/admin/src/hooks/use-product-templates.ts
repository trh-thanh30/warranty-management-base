"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreateProductTemplateBody,
  ListProductTemplatesQuery,
  PaginatedResponse,
  ProductTemplateSummary,
  UpdateProductTemplateBody,
} from "@repo/shared";
import { productTemplatesService } from "@/src/services/product-templates/product-templates.service";

export const productTemplateKeys = {
  all: ["product-templates"] as const,
  detail: (id: string | null) =>
    [...productTemplateKeys.all, "detail", id] as const,
  list: (query: ListProductTemplatesQuery) =>
    [...productTemplateKeys.all, "list", query] as const,
};

export function useProductTemplates(
  query: ListProductTemplatesQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ProductTemplateSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: productTemplateKeys.list(query),
    queryFn: () => productTemplatesService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useProductTemplate(
  templateId: string | null,
  options?: Pick<UseQueryOptions<ProductTemplateSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: productTemplateKeys.detail(templateId),
    queryFn: () => productTemplatesService.detail(templateId ?? ""),
  });
}

export function useCreateProductTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductTemplateBody) =>
      productTemplatesService.create(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productTemplateKeys.all }),
  });
}

export function useUpdateProductTemplate(templateId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductTemplateBody) =>
      productTemplatesService.update(templateId ?? "", body),
    onSuccess: (template) => {
      queryClient.setQueryData(
        productTemplateKeys.detail(template.id),
        template,
      );
      void queryClient.invalidateQueries({
        queryKey: productTemplateKeys.all,
      });
    },
  });
}

export function useDeactivateProductTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      productTemplatesService.deactivate(templateId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productTemplateKeys.all }),
  });
}

export function useCreateProductTemplateFromProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      productTemplatesService.createFromProduct(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productTemplateKeys.all }),
  });
}
