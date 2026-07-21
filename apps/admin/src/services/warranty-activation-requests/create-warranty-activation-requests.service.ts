import type {
  CreateWarrantyActivationRequestBody,
  ListWarrantyActivationRequestsQuery,
  PaginatedResponse,
  ReviewWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { WarrantyActivationRequestsHttpClient } from "./warranty-activation-requests.types";

export function createWarrantyActivationRequestsService(
  http: WarrantyActivationRequestsHttpClient,
) {
  return {
    async listWarrantyActivationRequests(
      query: ListWarrantyActivationRequestsQuery,
    ): Promise<PaginatedResponse<WarrantyActivationRequestSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<WarrantyActivationRequestSummary>>(
          "/warranty-activation-requests",
          { params: query },
        ),
      );
    },

    async getWarrantyActivationRequest(
      requestId: string,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.get<WarrantyActivationRequestSummary>(
          `/warranty-activation-requests/${requestId}`,
        ),
      );
    },

    async createWarrantyActivationRequest(
      body: CreateWarrantyActivationRequestBody,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.post<WarrantyActivationRequestSummary>(
          "/warranty-activation-requests",
          body,
        ),
      );
    },

    async reviewWarrantyActivationRequest(
      requestId: string,
      body: ReviewWarrantyActivationRequestBody,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.patch<WarrantyActivationRequestSummary>(
          `/warranty-activation-requests/${requestId}/review`,
          body,
        ),
      );
    },
  };
}
