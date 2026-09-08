import type {
  ActivationProductOption,
  AttachProductAssetBody,
  CreateProductBody,
  ListActivationProductOptionsQuery,
  ListProductsQuery,
  PaginatedResponse,
  ProductResponse,
  ProductAssetSummary,
  UpdateProductBody,
  UpdateProductAssetBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
import type {
  ConfirmProductImportBody,
  ProductImportConfirmResult,
  ProductImportPreview,
  ProductsHttpClient,
} from "./products.types";

export function createProductsService(http: ProductsHttpClient) {
  return {
    async listActivationProductOptions(
      query: ListActivationProductOptionsQuery,
    ): Promise<PaginatedResponse<ActivationProductOption>> {
      return unwrap(
        await http.get<PaginatedResponse<ActivationProductOption>>(
          "/products/activation-options",
          { params: query },
        ),
      );
    },

    async listProducts(
      query: ListProductsQuery,
    ): Promise<PaginatedResponse<ProductResponse>> {
      return unwrap(
        await http.get<PaginatedResponse<ProductResponse>>("/products", {
          params: query,
        }),
      );
    },

    async getProduct(productId: string): Promise<ProductResponse> {
      return unwrap(await http.get<ProductResponse>(`/products/${productId}`));
    },

    async getProductCloneDraft(productId: string): Promise<ProductResponse> {
      return unwrap(
        await http.get<ProductResponse>(`/products/${productId}/clone-draft`),
      );
    },

    async createProduct(body: CreateProductBody): Promise<ProductResponse> {
      return unwrap(await http.post<ProductResponse>("/products", body));
    },

    async updateProduct(
      productId: string,
      body: UpdateProductBody,
    ): Promise<ProductResponse> {
      return unwrap(
        await http.patch<ProductResponse>(`/products/${productId}`, body),
      );
    },

    async deleteProduct(productId: string): Promise<ProductResponse> {
      return unwrap(
        await http.delete<ProductResponse>(`/products/${productId}`),
      );
    },

    async restoreProduct(productId: string): Promise<ProductResponse> {
      return unwrap(
        await http.patch<ProductResponse>(`/products/${productId}/restore`),
      );
    },

    async attachAsset(
      productId: string,
      body: AttachProductAssetBody,
    ): Promise<ProductAssetSummary> {
      return unwrap(
        await http.post<ProductAssetSummary>(
          `/products/${productId}/assets`,
          body,
        ),
      );
    },

    async updateAsset(
      productId: string,
      productAssetId: string,
      body: UpdateProductAssetBody,
    ): Promise<void> {
      await http.patch(`/products/${productId}/assets/${productAssetId}`, body);
    },

    async removeAsset(
      productId: string,
      productAssetId: string,
    ): Promise<void> {
      await http.delete(`/products/${productId}/assets/${productAssetId}`);
    },

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>("/products/import-template", {
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async exportProducts(query: ListProductsQuery): Promise<Blob> {
      const response = await http.get<Blob>("/products/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async previewImport(file: File): Promise<ProductImportPreview> {
      const formData = new FormData();
      formData.append("file", file);

      return unwrap(
        await http.post<ProductImportPreview>(
          "/products/import/preview",
          formData,
        ),
      );
    },

    async confirmImport(
      body: ConfirmProductImportBody,
    ): Promise<ProductImportConfirmResult> {
      return unwrap(
        await http.post<ProductImportConfirmResult>(
          "/products/import/confirm",
          body,
        ),
      );
    },
  };
}
