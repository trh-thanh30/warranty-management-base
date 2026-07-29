import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  HttpClient,
  ListPublicProductsQuery,
  PaginatedResponse,
  PublicProductDetail,
  PublicProductSummary,
} from "@repo/shared";

export class ProductsService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listProducts(
    query: ListPublicProductsQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<PublicProductSummary>> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<PublicProductSummary>>
    >("/public/products", { params: query, signal });

    return response.data;
  }

  async getProductDetail(
    slug: string,
    signal?: AbortSignal,
  ): Promise<PublicProductDetail> {
    const response = await this.http.get<ApiResponse<PublicProductDetail>>(
      `/public/products/${encodeURIComponent(slug)}`,
      { signal },
    );

    return response.data;
  }
}

export const productsService = new ProductsService(publicHttpClient);
