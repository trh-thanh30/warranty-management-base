import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  CreateWarrantyClaimBody,
  HttpClient,
  PublicWarrantyClaimSummary,
} from "@repo/shared";
import { normalizeWarrantyClaimCode } from "@repo/shared/utils";

export class WarrantyClaimsService {
  constructor(private readonly http: Pick<HttpClient, "get" | "post">) {}

  async getWarrantyClaimByCode(
    claimCode: string,
  ): Promise<PublicWarrantyClaimSummary> {
    const normalizedClaimCode = normalizeWarrantyClaimCode(claimCode);
    const response = await this.http.get<
      ApiResponse<PublicWarrantyClaimSummary>
    >(
      `/public/warranty-claims/by-code/${encodeURIComponent(normalizedClaimCode)}`,
    );

    return response.data;
  }

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
