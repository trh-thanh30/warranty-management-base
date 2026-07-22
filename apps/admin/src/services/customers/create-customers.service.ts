import type {
  CreateCustomerBody,
  CustomerSummary,
  ListCustomersQuery,
  PaginatedResponse,
  UpdateCustomerBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
import type {
  CustomerImportResult,
  CustomersHttpClient,
} from "./customers.types";

export function createCustomersService(http: CustomersHttpClient) {
  return {
    async listCustomers(
      query: ListCustomersQuery,
    ): Promise<PaginatedResponse<CustomerSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<CustomerSummary>>("/customers", {
          params: query,
        }),
      );
    },

    async getCustomer(customerId: string): Promise<CustomerSummary> {
      return unwrap(
        await http.get<CustomerSummary>(`/customers/${customerId}`),
      );
    },

    async createCustomer(body: CreateCustomerBody): Promise<CustomerSummary> {
      return unwrap(await http.post<CustomerSummary>("/customers", body));
    },

    async updateCustomer(
      customerId: string,
      body: UpdateCustomerBody,
    ): Promise<CustomerSummary> {
      return unwrap(
        await http.patch<CustomerSummary>(`/customers/${customerId}`, body),
      );
    },

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>("/customers/import-template", {
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async exportCustomers(query: ListCustomersQuery): Promise<Blob> {
      const response = await http.get<Blob>("/customers/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async importCustomers(file: File): Promise<CustomerImportResult> {
      const formData = new FormData();
      formData.append("file", file);

      return unwrap(
        await http.post<CustomerImportResult>("/customers/import", formData),
      );
    },
  };
}
