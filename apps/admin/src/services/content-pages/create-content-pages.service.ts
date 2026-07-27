import type {
  ContentPageSummary,
  CreateContentPageBody,
  ListContentPagesQuery,
  PaginatedResponse,
  ParseContentDocumentResult,
  ReorderContentPageFaqItemsBody,
  UpdateContentPageBody,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { ContentPagesHttpClient } from "./content-pages.types";

export function createContentPagesService(http: ContentPagesHttpClient) {
  return {
    async list(query: ListContentPagesQuery) {
      return unwrap(
        await http.get<PaginatedResponse<ContentPageSummary>>(
          "/content-pages",
          {
            params: query,
          },
        ),
      );
    },
    async get(id: string) {
      return unwrap(await http.get<ContentPageSummary>(`/content-pages/${id}`));
    },
    async create(body: CreateContentPageBody) {
      return unwrap(
        await http.post<ContentPageSummary>("/content-pages", body),
      );
    },
    async update(id: string, body: UpdateContentPageBody) {
      return unwrap(
        await http.patch<ContentPageSummary>(`/content-pages/${id}`, body),
      );
    },
    async reorderFaqItems(id: string, body: ReorderContentPageFaqItemsBody) {
      return unwrap(
        await http.patch<ContentPageSummary>(
          `/content-pages/${id}/faq-items/reorder`,
          body,
        ),
      );
    },
    async delete(id: string) {
      await http.delete<void>(`/content-pages/${id}`);
    },
    async parseDocument(file: File) {
      const formData = new FormData();
      formData.append("file", file);

      return unwrap(
        await http.post<ParseContentDocumentResult>(
          "/content-pages/parse-document",
          formData,
        ),
      );
    },
  };
}
