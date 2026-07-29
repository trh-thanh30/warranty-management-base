import type {
  ApiResponse,
  ContentPageSummary,
  HttpClient,
  PaginatedResponse,
} from "@repo/shared";
import { publicHttpClient } from "@/src/lib/public-http-client";

export class ContentPagesService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async getPublishedContentPage(slug: string): Promise<ContentPageSummary> {
    const response = await this.http.get<ApiResponse<ContentPageSummary>>(
      `/public/content-pages/${encodeURIComponent(slug)}`,
    );

    return response.data;
  }

  async listPublishedContentPages(): Promise<ContentPageSummary[]> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<ContentPageSummary>>
    >("/public/content-pages", {
      params: {
        limit: 100,
        sortBy: "title",
        sortOrder: "asc",
      },
    });

    return response.data.items;
  }
}

export const contentPagesService = new ContentPagesService(publicHttpClient);
