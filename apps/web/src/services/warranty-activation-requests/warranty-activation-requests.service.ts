import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  CreatePublicWarrantyActivationRequestBody,
  HttpClient,
  WarrantyActivationRequestSummary,
} from "@repo/shared";

export class WarrantyActivationRequestsService {
  constructor(private readonly http: Pick<HttpClient, "post">) {}

  async createActivationRequest(
    body: CreatePublicWarrantyActivationRequestBody,
  ): Promise<WarrantyActivationRequestSummary> {
    const response = await this.http.post<
      ApiResponse<WarrantyActivationRequestSummary>
    >("/public/warranty-activation-requests", body);

    return response.data;
  }
}

export const warrantyActivationRequestsService =
  new WarrantyActivationRequestsService(publicHttpClient);
