import type { WarrantyActivationRequestSummary } from "@repo/shared";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatActivationRequestDate(value: string | null) {
  if (!value) return "-";

  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatActivationRequestCustomer(
  request: WarrantyActivationRequestSummary,
) {
  return [request.customerName, request.customerPhone, request.customerEmail]
    .filter(Boolean)
    .join(" · ");
}

export function formatActivationRequestProduct(
  request: WarrantyActivationRequestSummary,
) {
  return [
    request.productName,
    request.brand,
    request.model,
    request.serialNumber,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatActivationRequestAddress(
  request: WarrantyActivationRequestSummary,
) {
  return (
    request.fullAddress ||
    [request.addressDetail, request.wardName, request.provinceName]
      .filter(Boolean)
      .join(", ")
  );
}
