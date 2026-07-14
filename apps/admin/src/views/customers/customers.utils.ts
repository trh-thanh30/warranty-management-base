import { formatDate, type CustomerSummary } from "@repo/shared";

export function getCustomerDisplayName(customer: CustomerSummary) {
  return customer.fullName || customer.customerCode;
}

export function formatCustomerCreatedAt(createdAt: string) {
  return formatDate(createdAt);
}

export function getCustomerContact(customer: CustomerSummary) {
  return customer.phone || customer.email || null;
}
