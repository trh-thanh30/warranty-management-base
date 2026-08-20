export type CustomerSummary = {
  id: string;
  userId: string | null;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  birthdate: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ListCustomersQuery = {
  page?: number;
  limit?: number;
  search?: string;
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
  birthdate?: string;
};

export type UpdateCustomerBody = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthdate?: string | null;
};
