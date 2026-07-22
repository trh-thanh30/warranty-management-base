import type { CustomerSummary } from "@repo/shared";

export function formatCustomerSearchOption(customer: CustomerSummary) {
  return [
    customer.fullName,
    customer.customerCode,
    customer.phone,
    customer.email,
  ]
    .filter(Boolean)
    .join(" · ");
}
