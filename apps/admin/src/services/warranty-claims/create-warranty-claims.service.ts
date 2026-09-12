import type {
  AssignWarrantyClaimServiceCenterBody,
  CompleteWarrantyClaimBody,
  CreateWarrantyClaimBody,
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
import { unwrap, unwrapBlob } from "../service.utils.ts";
import type { WarrantyClaimsHttpClient } from "./warranty-claims.types";

export function createWarrantyClaimsService(http: WarrantyClaimsHttpClient) {
  return {
    async createWarrantyClaim(
      body: CreateWarrantyClaimBody,
      attachments: File[],
    ): Promise<WarrantyClaimSummary> {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value);
      });
      attachments.forEach((file) => formData.append("attachments", file));

      return unwrap(
        await http.post<WarrantyClaimSummary>("/warranty-claims", formData, {
          timeout: 120_000,
        }),
      );
    },

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

    async exportWarrantyClaims(query: ListWarrantyClaimsQuery): Promise<Blob> {
      const response = await http.get<Blob>("/warranty-claims/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
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

    async completeWarrantyClaim(
      claimId: string,
      body: CompleteWarrantyClaimBody,
    ): Promise<WarrantyClaimSummary> {
      return unwrap(
        await http.patch<WarrantyClaimSummary>(
          `/warranty-claims/${claimId}/complete`,
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
