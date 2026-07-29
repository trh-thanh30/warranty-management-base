import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  HttpClient,
  ListPublicProductCategoriesQuery,
  PaginatedResponse,
  PublicProductCategory,
} from "@repo/shared";

export class ProductCategoriesService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listProductCategories(
    query: ListPublicProductCategoriesQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<PublicProductCategory>> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<PublicProductCategory>>
    >("/public/product-categories", { params: query, signal });
    return response.data;
  }
}

export const productCategoriesService = new ProductCategoriesService(
  publicHttpClient,
);
