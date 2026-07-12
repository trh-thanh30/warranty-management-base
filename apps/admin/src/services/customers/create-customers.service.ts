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
  };
}
