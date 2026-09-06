import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  CreatePublicWarrantyActivationRequestBody,
  HttpClient,
  PublicWarrantyActivationRequestReceipt,
} from "@repo/shared";

export class WarrantyActivationRequestsService {
  constructor(private readonly http: Pick<HttpClient, "post">) {}

  async createActivationRequest(
    body: CreatePublicWarrantyActivationRequestBody,
  ): Promise<PublicWarrantyActivationRequestReceipt> {
    const response = await this.http.post<
      ApiResponse<PublicWarrantyActivationRequestReceipt>
    >("/public/warranty-activation-requests", body);

    return response.data;
  }
}

export const warrantyActivationRequestsService =
  new WarrantyActivationRequestsService(publicHttpClient);
