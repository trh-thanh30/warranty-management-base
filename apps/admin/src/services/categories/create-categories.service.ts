import type {
  CategoryResponse,
  CategoryParentOption,
  CategoryTreeResponse,
  CategoryImportResult,
  CreateCategoryBody,
  ListCategoriesQuery,
  ListCategoryParentOptionsQuery,
  ListCategoryTreeQuery,
  PaginatedResponse,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
import type { CategoriesHttpClient } from "./categories.types";

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

    async listCategoryTree(
      query: ListCategoryTreeQuery,
    ): Promise<CategoryTreeResponse> {
      return unwrap(
        await http.get<CategoryTreeResponse>("/categories/tree", {
          params: query,
        }),
      );
    },

    async listCategoryParentOptions(
      query: ListCategoryParentOptionsQuery,
    ): Promise<CategoryParentOption[]> {
      return unwrap(
        await http.get<CategoryParentOption[]>("/categories/parent-options", {
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

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>("/categories/import-template", {
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async exportCategories(query: ListCategoriesQuery): Promise<Blob> {
      const response = await http.get<Blob>("/categories/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async importCategories(file: File): Promise<CategoryImportResult> {
      const formData = new FormData();
      formData.append("file", file);
      return unwrap(
        await http.post<CategoryImportResult>("/categories/import", formData),
      );
    },
  };
}
