import type {
  CreateAdminWarrantyActivationRequestBody,
  CreateWarrantyActivationRequestBody,
  ListWarrantyActivationRequestsQuery,
  PaginatedResponse,
  ReviewWarrantyActivationRequestBody,
  UpdateAdminWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
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

    async exportWarrantyActivationRequests(
      query: ListWarrantyActivationRequestsQuery,
    ): Promise<Blob> {
      const response = await http.get<Blob>(
        "/warranty-activation-requests/export",
        { params: query, responseType: "blob" },
      );
      return unwrapBlob(response);
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

    async createAdminWarrantyActivationRequest(
      body: CreateAdminWarrantyActivationRequestBody,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.post<WarrantyActivationRequestSummary>(
          "/warranty-activation-requests/admin",
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

    async updateAdminWarrantyActivationRequest(
      requestId: string,
      body: UpdateAdminWarrantyActivationRequestBody,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.patch<WarrantyActivationRequestSummary>(
          `/warranty-activation-requests/${requestId}`,
          body,
        ),
      );
    },

    async resendWarrantyActivationRequestCertificateEmail(
      requestId: string,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.post<WarrantyActivationRequestSummary>(
          `/warranty-activation-requests/${requestId}/certificate/resend-email`,
          {},
        ),
      );
    },

    async viewWarrantyActivationRequestCertificate(
      requestId: string,
    ): Promise<Blob> {
      const response = await http.get<Blob>(
        `/warranty-activation-requests/${requestId}/certificate/view`,
        { responseType: "blob" },
      );
      return unwrapBlob(response);
    },

    async downloadWarrantyActivationRequestCertificate(
      requestId: string,
    ): Promise<Blob> {
      const response = await http.get<Blob>(
        `/warranty-activation-requests/${requestId}/certificate/download`,
        { responseType: "blob" },
      );
      return unwrapBlob(response);
    },
    async retryWarrantyActivationRequestCertificate(
      requestId: string,
    ): Promise<WarrantyActivationRequestSummary> {
      return unwrap(
        await http.post<WarrantyActivationRequestSummary>(
          `/warranty-activation-requests/${requestId}/certificate/retry`,
          {},
        ),
      );
    },
  };
}
