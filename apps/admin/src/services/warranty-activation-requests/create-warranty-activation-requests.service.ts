import type {
  CreateWarrantyActivationRequestBody,
  ListWarrantyActivationRequestsQuery,
  PaginatedResponse,
  ReviewWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

type RequestConfig = {
  params?: Record<string, unknown>;
};

export type WarrantyActivationRequestsHttpClient = {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

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
