import type { CustomerSummary } from "@repo/shared";

export function getCustomerDisplayName(customer: CustomerSummary) {
  return customer.fullName || customer.customerCode;
}

export function formatCustomerCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(createdAt));
}

export function getCustomerContact(customer: CustomerSummary) {
  return customer.phone || customer.email || null;
}
