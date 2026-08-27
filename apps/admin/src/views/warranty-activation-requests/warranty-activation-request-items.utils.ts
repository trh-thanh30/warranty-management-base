import type { WarrantyActivationRequestSummary } from "@repo/shared";

export function getActivationRequestProductCount(
  request: WarrantyActivationRequestSummary,
) {
  if (typeof request.itemCount === "number" && request.itemCount > 0) {
    return request.itemCount;
  }
  if (request.items?.length) return request.items.length;
  return request.productId || request.productName ? 1 : 0;
}

export function getActivationRequestProductTitle(
  request: WarrantyActivationRequestSummary,
  formatCount: (count: number) => string,
) {
  const count = getActivationRequestProductCount(request);
  if (count > 1) return formatCount(count);
  return request.items?.[0]?.productName ?? request.productName ?? "-";
}

export function getActivationRequestWarrantyCodeLabel(
  request: WarrantyActivationRequestSummary,
  formatCount: (count: number) => string,
) {
  const items = request.items ?? [];
  if (items.length > 1) return formatCount(items.length);
  return items[0]?.warrantyCode ?? request.warrantyCode ?? "-";
}

export function getActivationRequestProductNames(
  request: WarrantyActivationRequestSummary,
) {
  if (request.items?.length) {
    return request.items.map((item) => item.productName);
  }
  return request.productName ? [request.productName] : [];
}

export function getActivationRequestWarrantyCodes(
  request: WarrantyActivationRequestSummary,
) {
  if (request.items?.length) {
    return request.items.map((item) => item.warrantyCode);
  }
  return request.warrantyCode ? [request.warrantyCode] : [];
}
