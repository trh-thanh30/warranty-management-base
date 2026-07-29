import type {
  ApiResponse,
  HttpClient,
  ListPublicDealersQuery,
  PaginatedResponse,
  PublicDealerFilterOptions,
  PublicDealerLocation,
} from "@repo/shared";
import { publicHttpClient } from "@/src/lib/public-http-client";

export class PublicDealersService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listDealers(
    query: ListPublicDealersQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<PublicDealerLocation>> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<PublicDealerLocation>>
    >("/public/dealers", { params: query, signal });

    return response.data;
  }

  async listFilterOptions(
    province?: string,
    signal?: AbortSignal,
  ): Promise<PublicDealerFilterOptions> {
    const response = await this.http.get<
      ApiResponse<PublicDealerFilterOptions>
    >("/public/dealers/filter-options", {
      params: province ? { province } : undefined,
      signal,
    });

    return response.data;
  }
}

export const publicDealersService = new PublicDealersService(publicHttpClient);
