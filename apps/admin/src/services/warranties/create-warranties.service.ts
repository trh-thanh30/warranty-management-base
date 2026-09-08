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
  UpdateWarrantyBody,
  VoidWarrantyBody,
  TransferWarrantyOwnerBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
import type { WarrantiesHttpClient } from "./warranties.types";

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

    async exportWarranties(query: ListWarrantiesQuery): Promise<Blob> {
      const response = await http.get<Blob>("/warranties/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async lookupWarranty(code: string): Promise<WarrantyLookupResult> {
      return unwrap(
        await http.get<WarrantyLookupResult>("/warranties/lookup", {
          params: { code },
        }),
      );
    },

    async getWarrantyDetail(warrantyId: string): Promise<WarrantyListItem> {
      return unwrap(
        await http.get<WarrantyListItem>(`/warranties/${warrantyId}`),
      );
    },

    async updateWarranty(
      warrantyId: string,
      body: UpdateWarrantyBody,
    ): Promise<WarrantyListItem> {
      return unwrap(
        await http.patch<WarrantyListItem>(`/warranties/${warrantyId}`, body),
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
      warrantyId: string,
      body: ActivateWarrantyBody,
    ): Promise<WarrantySummary> {
      return unwrap(
        await http.post<WarrantySummary>(
          `/warranties/${warrantyId}/activate`,
          body,
        ),
      );
    },

    async voidWarranty(
      warrantyId: string,
      body: VoidWarrantyBody,
    ): Promise<WarrantySummary> {
      return unwrap(
        await http.post<WarrantySummary>(
          `/warranties/${warrantyId}/void`,
          body,
        ),
      );
    },

    async transferOwner(
      warrantyId: string,
      body: TransferWarrantyOwnerBody,
    ): Promise<WarrantyListItem> {
      return unwrap(
        await http.post<WarrantyListItem>(
          `/warranties/${warrantyId}/transfer-owner`,
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
