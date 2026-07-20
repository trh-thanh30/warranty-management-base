import type {
  AssignProductOwnerBody,
  AttachProductAssetBody,
  CreateProductBody,
  ListProductsQuery,
  PaginatedResponse,
  ProductResponse,
  ProductAssetSummary,
  UpdateProductBody,
  UpdateProductAssetBody,
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

export type ProductsHttpClient = {
  delete<T>(url: string): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function createProductsService(http: ProductsHttpClient) {
  return {
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

    async assignOwner(
      productId: string,
      body: AssignProductOwnerBody,
    ): Promise<ProductResponse> {
      return unwrap(
        await http.post<ProductResponse>(
          `/products/${productId}/assign-owner`,
          body,
        ),
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
  };
}
