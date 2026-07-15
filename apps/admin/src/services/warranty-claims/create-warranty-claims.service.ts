import type {
  AssignWarrantyClaimServiceCenterBody,
  ListWarrantyClaimsQuery,
  PaginatedResponse,
  UpdateWarrantyClaimPriorityBody,
  UpdateWarrantyClaimStatusBody,
  WarrantyClaimMetrics,
  WarrantyClaimMetricsQuery,
  WarrantyClaimAttachmentSummary,
  WarrantyClaimSummary,
  WarrantyClaimTimelineItem,
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

export type WarrantyClaimsHttpClient = {
  delete<T>(url: string): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function createWarrantyClaimsService(http: WarrantyClaimsHttpClient) {
  return {
    async linkAttachment(
      claimId: string,
      assetId: string,
    ): Promise<WarrantyClaimAttachmentSummary> {
      return unwrap(
        await http.post<WarrantyClaimAttachmentSummary>(
          `/warranty-claims/${claimId}/assets`,
          { assetId },
        ),
      );
    },

    async unlinkAttachment(claimId: string, assetId: string): Promise<void> {
      await http.delete<{ success: true }>(
        `/warranty-claims/${claimId}/assets/${assetId}`,
      );
    },

    async listWarrantyClaims(
      query: ListWarrantyClaimsQuery,
    ): Promise<PaginatedResponse<WarrantyClaimSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<WarrantyClaimSummary>>(
          "/warranty-claims",
          {
            params: query,
          },
        ),
      );
    },

    async getWarrantyClaim(claimId: string): Promise<WarrantyClaimSummary> {
      return unwrap(
        await http.get<WarrantyClaimSummary>(`/warranty-claims/${claimId}`),
      );
    },

    async getWarrantyClaimTimeline(
      claimId: string,
    ): Promise<WarrantyClaimTimelineItem[]> {
      return unwrap(
        await http.get<WarrantyClaimTimelineItem[]>(
          `/warranty-claims/${claimId}/timeline`,
        ),
      );
    },

    async getMetrics(
      query: WarrantyClaimMetricsQuery,
    ): Promise<WarrantyClaimMetrics> {
      return unwrap(
        await http.get<WarrantyClaimMetrics>(
          "/warranty-claims/metrics/summary",
          {
            params: query,
          },
        ),
      );
    },

    async updateStatus(
      claimId: string,
      body: UpdateWarrantyClaimStatusBody,
    ): Promise<WarrantyClaimSummary> {
      return unwrap(
        await http.patch<WarrantyClaimSummary>(
          `/warranty-claims/${claimId}/status`,
          body,
        ),
      );
    },

    async assignServiceCenter(
      claimId: string,
      body: AssignWarrantyClaimServiceCenterBody,
    ): Promise<WarrantyClaimSummary> {
      return unwrap(
        await http.patch<WarrantyClaimSummary>(
          `/warranty-claims/${claimId}/assign-service-center`,
          body,
        ),
      );
    },

    async updatePriority(
      claimId: string,
      body: UpdateWarrantyClaimPriorityBody,
    ): Promise<WarrantyClaimSummary> {
      return unwrap(
        await http.patch<WarrantyClaimSummary>(
          `/warranty-claims/${claimId}/priority`,
          body,
        ),
      );
    },
  };
}
