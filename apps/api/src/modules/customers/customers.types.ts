import type { CustomerSummary } from '@repo/shared';
import type { Customer } from '@prisma/client';

export type CustomerResponse = CustomerSummary;

export function toCustomerResponse(customer: Customer): CustomerResponse {
  return {
    id: customer.id,
    userId: customer.user_id,
    customerCode: customer.customer_code,
    fullName: customer.full_name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    birthdate: customer.birthdate?.toISOString() ?? null,
    metadata: customer.metadata as Record<string, unknown> | null,
    createdAt: customer.created_at.toISOString(),
    updatedAt: customer.updated_at.toISOString(),
    status: customer.deleted_at ? 'DELETED' : 'ACTIVE',
  };
}
