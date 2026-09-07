import type {
  CreateDealerBody,
  AddDealerMemberBody,
  DealerActivatedCustomerSummary,
  DealerImportResult,
  DealerResponse,
  DealerMembershipSummary,
  ListDealerActivatedCustomersQuery,
  ListDealersQuery,
  PaginatedResponse,
  UpdateDealerBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils";
import type { DealersHttpClient } from "./dealers.types";

export function createDealersService(http: DealersHttpClient) {
  return {
    async listDealers(
      query: ListDealersQuery,
    ): Promise<PaginatedResponse<DealerResponse>> {
      return unwrap(
        await http.get<PaginatedResponse<DealerResponse>>("/dealers/managed", {
          params: query,
        }),
      );
    },

    async listProvinces(): Promise<string[]> {
      return unwrap(await http.get<string[]>("/dealers/provinces"));
    },

    async getDealer(dealerId: string): Promise<DealerResponse> {
      return unwrap(await http.get<DealerResponse>(`/dealers/${dealerId}`));
    },

    async listMembers(dealerId: string): Promise<DealerMembershipSummary[]> {
      return unwrap(
        await http.get<DealerMembershipSummary[]>(
          `/dealers/${dealerId}/members`,
        ),
      );
    },

    async addMember(
      dealerId: string,
      body: AddDealerMemberBody,
    ): Promise<DealerMembershipSummary> {
      return unwrap(
        await http.post<DealerMembershipSummary>(
          `/dealers/${dealerId}/members`,
          body,
        ),
      );
    },

    async removeMember(
      dealerId: string,
      membershipId: string,
    ): Promise<{ id: string }> {
      return unwrap(
        await http.delete<{ id: string }>(
          `/dealers/${dealerId}/members/${membershipId}`,
        ),
      );
    },

    async listActivatedCustomers(
      dealerId: string,
      query: ListDealerActivatedCustomersQuery,
    ): Promise<PaginatedResponse<DealerActivatedCustomerSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<DealerActivatedCustomerSummary>>(
          `/dealers/${dealerId}/activated-customers`,
          { params: query },
        ),
      );
    },

    async createDealer(body: CreateDealerBody): Promise<DealerResponse> {
      return unwrap(await http.post<DealerResponse>("/dealers", body));
    },

    async updateDealer(
      dealerId: string,
      body: UpdateDealerBody,
    ): Promise<DealerResponse> {
      return unwrap(
        await http.patch<DealerResponse>(`/dealers/${dealerId}`, body),
      );
    },

    async deactivateDealer(dealerId: string): Promise<DealerResponse> {
      return unwrap(
        await http.patch<DealerResponse>(`/dealers/${dealerId}/deactivate`),
      );
    },

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>("/dealers/import-template", {
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async exportDealers(query: ListDealersQuery): Promise<Blob> {
      const response = await http.get<Blob>("/dealers/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async importDealers(file: File): Promise<DealerImportResult> {
      const formData = new FormData();
      formData.append("file", file);
      return unwrap(
        await http.post<DealerImportResult>("/dealers/import", formData),
      );
    },
  };
}
