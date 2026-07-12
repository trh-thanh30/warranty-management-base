import type {
  CategoryResponse,
  CreateCategoryBody,
  ListCategoriesQuery,
  PaginatedResponse,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@repo/shared";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

type RequestConfig = {
  params?: Record<string, unknown>;
};

export type CategoriesHttpClient = {
  delete<T>(url: string): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function createCategoriesService(http: CategoriesHttpClient) {
  return {
    async listCategories(
      query: ListCategoriesQuery,
    ): Promise<PaginatedResponse<CategoryResponse>> {
      return unwrap(
        await http.get<PaginatedResponse<CategoryResponse>>("/categories", {
          params: query,
        }),
      );
    },

    async getCategory(categoryId: string): Promise<CategoryResponse> {
      return unwrap(
        await http.get<CategoryResponse>(`/categories/${categoryId}`),
      );
    },

    async createCategory(body: CreateCategoryBody): Promise<CategoryResponse> {
      return unwrap(await http.post<CategoryResponse>("/categories", body));
    },

    async updateCategory(
      categoryId: string,
      body: UpdateCategoryBody,
    ): Promise<CategoryResponse> {
      return unwrap(
        await http.patch<CategoryResponse>(`/categories/${categoryId}`, body),
      );
    },

    async deactivateCategory(categoryId: string): Promise<CategoryResponse> {
      return unwrap(
        await http.delete<CategoryResponse>(`/categories/${categoryId}`),
      );
    },

    async reorderCategories(
      body: ReorderCategoriesBody,
    ): Promise<CategoryResponse[]> {
      return unwrap(
        await http.patch<CategoryResponse[]>("/categories/reorder", body),
      );
    },
  };
}
