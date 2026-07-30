import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  CreateWarrantyClaimBody,
  HttpClient,
  PublicWarrantyClaimSummary,
} from "@repo/shared";

export class WarrantyClaimsService {
  constructor(private readonly http: Pick<HttpClient, "post">) {}

  async createWarrantyClaim(
    body: CreateWarrantyClaimBody,
  ): Promise<PublicWarrantyClaimSummary> {
    const response = await this.http.post<
      ApiResponse<PublicWarrantyClaimSummary>
    >("/public/warranty-claims", body);

    return response.data;
  }
}

export const warrantyClaimsService = new WarrantyClaimsService(
  publicHttpClient,
);
