import type {
  CreateCustomerBody,
  CustomerSummary,
  ListCustomersQuery,
  PaginatedResponse,
  UpdateCustomerBody,
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
  responseType?: "blob";
};

export type CustomersHttpClient = {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

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
      return response.data as unknown as Blob;
    },

    async exportCustomers(query: ListCustomersQuery): Promise<Blob> {
      const response = await http.get<Blob>("/customers/export", {
        params: query,
        responseType: "blob",
      });
      return response.data as unknown as Blob;
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

export type CustomerImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    field: string;
    message: string;
    rowNumber: number;
  }>;
};
