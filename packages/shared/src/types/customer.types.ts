export type CustomerSummary = {
  id: string;
  userId: string | null;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  /** ISO-8601 string serialized by the Customer API, or null when unknown. */
  birthdate: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  status: CustomerStatus;
};

export type CustomerStatus = "ACTIVE" | "DELETED";

export type ListCustomersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus | "ALL";
  sortBy?:
    | "customerCode"
    | "fullName"
    | "phone"
    | "email"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CreateCustomerBody = {
  userId?: string;
  customerCode?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  /** Date-only value in YYYY-MM-DD format. */
  birthdate?: string;
};

export type UpdateCustomerBody = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** Date-only YYYY-MM-DD value; null explicitly clears the birthdate. */
  birthdate?: string | null;
};
