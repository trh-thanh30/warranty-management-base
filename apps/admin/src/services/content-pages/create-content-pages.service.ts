import type {
  ContentPageSummary,
  CreateContentPageBody,
  ListContentPagesQuery,
  PaginatedResponse,
  UpdateContentPageBody,
} from "@repo/shared";

type ApiEnvelope<T> = { success: boolean; data: T };
type HttpResponse<T> = { data: ApiEnvelope<T> };
type RequestConfig = { params?: Record<string, unknown> };

export type ContentPagesHttpClient = {
  delete<T>(url: string): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>) {
  return response.data.data;
}

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
    async delete(id: string) {
      await http.delete<void>(`/content-pages/${id}`);
    },
  };
}
