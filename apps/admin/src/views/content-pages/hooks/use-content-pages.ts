"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  ContentPageSummary,
  CreateContentPageBody,
  ListContentPagesQuery,
  PaginatedResponse,
  UpdateContentPageBody,
} from "@repo/shared";
import { contentPagesService } from "@/src/services/content-pages/content-pages.service";

export const contentPageKeys = {
  all: ["content-pages"] as const,
  lists: () => [...contentPageKeys.all, "list"] as const,
  list: (query: ListContentPagesQuery) =>
    [...contentPageKeys.lists(), query] as const,
  details: () => [...contentPageKeys.all, "detail"] as const,
  detail: (id: string | null) => [...contentPageKeys.details(), id] as const,
};

export function useContentPages(
  query: ListContentPagesQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<ContentPageSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: contentPageKeys.list(query),
    queryFn: () => contentPagesService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useContentPage(
  id: string | null,
  options?: Pick<UseQueryOptions<ContentPageSummary>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: contentPageKeys.detail(id),
    queryFn: () => contentPagesService.get(id ?? ""),
  });
}

export function useCreateContentPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContentPageBody) =>
      contentPagesService.create(body),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: contentPageKeys.lists() }),
  });
}

export function useUpdateContentPage(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateContentPageBody) =>
      contentPagesService.update(id ?? "", body),
    onSuccess: (page) => {
      void queryClient.invalidateQueries({ queryKey: contentPageKeys.lists() });
      queryClient.setQueryData(contentPageKeys.detail(page.id), page);
    },
  });
}

export function useReorderContentPageFaqItems(id: string | null) {
  return useMutation({
    mutationFn: (itemIds: string[]) =>
      contentPagesService.reorderFaqItems(id ?? "", { itemIds }),
  });
}

export function useUpdateContentPageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: UpdateContentPageBody["status"];
    }) => contentPagesService.update(id, { status }),
    onSuccess: (page) => {
      void queryClient.invalidateQueries({ queryKey: contentPageKeys.lists() });
      queryClient.setQueryData(contentPageKeys.detail(page.id), page);
    },
  });
}

export function useDeleteContentPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentPagesService.delete(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: contentPageKeys.lists() }),
  });
}

export function useParseContentDocument() {
  return useMutation({
    mutationFn: (file: File) => contentPagesService.parseDocument(file),
  });
}
