import { formatDate, type CustomerSummary } from "@repo/shared";
import type { CustomerFormValues } from "./customers.types";

type CustomerAddressSelectionInput = Pick<
  CustomerFormValues,
  "provinceName" | "wardName"
>;

type FillCustomerAddressSelectionInput = CustomerAddressSelectionInput & {
  currentAddress: string;
  previousSelection: string;
};

export function getCustomerAddressSelection({
  provinceName,
  wardName,
}: CustomerAddressSelectionInput) {
  const province = provinceName.trim();
  const ward = wardName.trim();
  if (!province || !ward) return "";

  return `${ward}, ${province}`;
}

export function fillCustomerAddressSelection({
  currentAddress,
  previousSelection,
  provinceName,
  wardName,
}: FillCustomerAddressSelectionInput) {
  const current = currentAddress.trim();
  const previous = previousSelection.trim();
  const next = getCustomerAddressSelection({ provinceName, wardName });
  if (!next) return current;
  if (!current || current === previous) return next;
  if (current.endsWith(next)) return current;

  if (previous && current.endsWith(previous)) {
    const detail = current
      .slice(0, -previous.length)
      .replace(/,\s*$/, "")
      .trim();
    return [detail, next].filter(Boolean).join(", ");
  }

  return `${current}, ${next}`;
}

export function buildCustomerAddress({
  addressDetail,
  provinceName,
  wardName,
}: Pick<CustomerFormValues, "addressDetail" | "provinceName" | "wardName">) {
  const detail = addressDetail.trim();
  const selection = getCustomerAddressSelection({ provinceName, wardName });
  if (!selection || detail.endsWith(selection)) return detail;

  return [detail, selection].filter(Boolean).join(", ");
}

export function getCustomerDisplayName(customer: CustomerSummary) {
  return customer.fullName || customer.customerCode;
}

export function formatCustomerCreatedAt(createdAt: string) {
  return formatDate(createdAt);
}

export function getCustomerContact(customer: CustomerSummary) {
  return customer.phone || customer.email || null;
}
