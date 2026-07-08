import { Customer } from '@prisma/client';

export type CustomerResponse = {
  id: string;
  userId: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toCustomerResponse(customer: Customer): CustomerResponse {
  return {
    id: customer.id,
    userId: customer.user_id,
    customerCode: customer.customer_code,
    fullName: customer.full_name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    metadata: customer.metadata as Record<string, unknown> | null,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
  };
}
