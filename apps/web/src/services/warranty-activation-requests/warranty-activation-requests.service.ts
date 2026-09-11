import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  CreatePublicWarrantyActivationRequestBody,
  HttpClient,
  PublicWarrantyActivationRequestReceipt,
  PublicWarrantyActivationRequestStatus,
} from "@repo/shared";
import { normalizeWarrantyActivationRequestCode } from "@repo/shared/utils";

export class WarrantyActivationRequestsService {
  constructor(private readonly http: Pick<HttpClient, "get" | "post">) {}

  async getActivationRequestByCode(
    requestCode: string,
  ): Promise<PublicWarrantyActivationRequestStatus> {
    const normalizedRequestCode =
      normalizeWarrantyActivationRequestCode(requestCode);
    const response = await this.http.get<
      ApiResponse<PublicWarrantyActivationRequestStatus>
    >(
      `/public/warranty-activation-requests/${encodeURIComponent(normalizedRequestCode)}`,
    );

    return response.data;
  }

  async createActivationRequest(
    body: CreatePublicWarrantyActivationRequestBody,
    turnstileToken?: string,
  ): Promise<PublicWarrantyActivationRequestReceipt> {
    const response = await this.http.post<
      ApiResponse<PublicWarrantyActivationRequestReceipt>
    >(
      "/public/warranty-activation-requests",
      body,
      turnstileToken
        ? { headers: { "X-Turnstile-Token": turnstileToken } }
        : undefined,
    );

    return response.data;
  }
}

export const warrantyActivationRequestsService =
  new WarrantyActivationRequestsService(publicHttpClient);
