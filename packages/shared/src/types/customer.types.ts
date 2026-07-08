export type CustomerSummary = {
  id: string;
  userId: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
