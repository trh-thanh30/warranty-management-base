import type {
  ApiResponse,
  HttpClient,
  ListPublicNetworkDirectoryQuery,
  PaginatedResponse,
  PublicNetworkDirectoryFilterOptions,
  PublicNetworkLocation,
} from "@repo/shared";
import { publicHttpClient } from "@/src/lib/public-http-client";

export class PublicNetworkDirectoryService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listLocations(
    query: ListPublicNetworkDirectoryQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<PublicNetworkLocation>> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<PublicNetworkLocation>>
    >("/public/network-directory", { params: query, signal });

    return response.data;
  }

  async listFilterOptions(
    province?: string,
    signal?: AbortSignal,
  ): Promise<PublicNetworkDirectoryFilterOptions> {
    const response = await this.http.get<
      ApiResponse<PublicNetworkDirectoryFilterOptions>
    >("/public/network-directory/filter-options", {
      params: province ? { province } : undefined,
      signal,
    });

    return response.data;
  }
}

export const publicNetworkDirectoryService = new PublicNetworkDirectoryService(
  publicHttpClient,
);
