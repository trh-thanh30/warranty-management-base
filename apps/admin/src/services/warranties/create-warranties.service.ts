import type {
  ActivateWarrantyBody,
  ActivateWarrantyByCodeBody,
  ListWarrantiesQuery,
  ManualWarrantyActivationBody,
  ManualWarrantyActivationResult,
  PaginatedResponse,
  WarrantyListItem,
  WarrantyLookupResult,
  WarrantySummary,
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

export type WarrantiesHttpClient = {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function createWarrantiesService(http: WarrantiesHttpClient) {
  return {
    async listWarranties(
      query: ListWarrantiesQuery,
    ): Promise<PaginatedResponse<WarrantyListItem>> {
      return unwrap(
        await http.get<PaginatedResponse<WarrantyListItem>>("/warranties", {
          params: query,
        }),
      );
    },

    async lookupWarranty(code: string): Promise<WarrantyLookupResult> {
      return unwrap(
        await http.get<WarrantyLookupResult>("/warranties/lookup", {
          params: { code },
        }),
      );
    },

    async activateWarrantyByCode(
      body: ActivateWarrantyByCodeBody,
    ): Promise<WarrantySummary> {
      return unwrap(
        await http.post<WarrantySummary>("/warranties/activate-by-code", body),
      );
    },

    async activateWarranty(
      productId: string,
      body: ActivateWarrantyBody,
    ): Promise<WarrantySummary> {
      return unwrap(
        await http.post<WarrantySummary>(
          `/products/${productId}/activate-warranty`,
          body,
        ),
      );
    },

    async manualActivation(
      body: ManualWarrantyActivationBody,
    ): Promise<ManualWarrantyActivationResult> {
      return unwrap(
        await http.post<ManualWarrantyActivationResult>(
          "/warranties/manual-activation",
          body,
        ),
      );
    },
  };
}
