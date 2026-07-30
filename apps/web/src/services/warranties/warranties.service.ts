import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  HttpClient,
  WarrantyLookupResult,
} from "@repo/shared";

export class WarrantiesService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async lookupWarranty(
    code: string,
    signal?: AbortSignal,
  ): Promise<WarrantyLookupResult> {
    const response = await this.http.get<ApiResponse<WarrantyLookupResult>>(
      "/public/warranties/lookup",
      {
        params: { code: code.trim().toUpperCase() },
        signal,
      },
    );

    return response.data;
  }
}

export const warrantiesService = new WarrantiesService(publicHttpClient);
