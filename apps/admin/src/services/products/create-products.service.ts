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
  responseType?: "blob";
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

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>("/products/import-template", {
        responseType: "blob",
      });
      return response.data as unknown as Blob;
    },

    async exportProducts(query: ListProductsQuery): Promise<Blob> {
      const response = await http.get<Blob>("/products/export", {
        params: query,
        responseType: "blob",
      });
      return response.data as unknown as Blob;
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

export type ProductImportRowData = {
  brand: string | null;
  category: string;
  categoryCode: string | null;
  description: string | null;
  imageUrl: string | null;
  manufactureYear: number | null;
  model: string | null;
  name: string;
  productCode: string | null;
  serialNumber: string | null;
  status: string;
  warrantyDurationMonths: number | null;
  warrantyTerms: string | null;
};

export type ProductImportRowError = {
  field: string;
  message: string;
  rowNumber: number;
};

export type ProductImportPreview = {
  errors: ProductImportRowError[];
  invalidRows: number;
  rows: Array<{
    data: Partial<ProductImportRowData>;
    errors: ProductImportRowError[];
    rowNumber: number;
  }>;
  totalRows: number;
  validRows: number;
};

export type ConfirmProductImportBody = {
  mode: "replace" | "upsert";
  rows: ProductImportRowData[];
};

export type ProductImportConfirmResult = {
  created: number;
  deactivated: number;
  errors: ProductImportRowError[];
  updated: number;
};
