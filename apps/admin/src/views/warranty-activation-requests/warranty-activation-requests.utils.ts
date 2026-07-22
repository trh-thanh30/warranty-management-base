import {
  HttpClientError,
  type CreateAdminWarrantyActivationRequestBody,
  type ProductResponse,
  type WarrantyActivationRequestSummary,
} from "@repo/shared";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import { translateFieldError } from "@/src/utils";
import type { WarrantyActivationRequestCreateFormValues } from "./warranty-activation-requests.types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const CREATE_FIELD_ERROR_KEYS = new Set([
  "addressRequired",
  "customerNameRequired",
  "emailInvalid",
  "noteLength",
  "phoneInvalid",
  "productRequired",
  "provinceRequired",
  "wardRequired",
  "warrantyCodeRequired",
]);

const CREATE_API_ERROR_CODES = new Set([
  "ACTIVATION_REQUEST_ALREADY_PENDING",
  "ACTIVATION_REQUEST_CREATE_FAILED",
  "CUSTOMER_OWNER_MISMATCH",
  "PRODUCT_NOT_ELIGIBLE_FOR_ACTIVATION_REQUEST",
  "PRODUCT_WARRANTY_NOT_FOUND",
  "WARRANTY_CODE_NOT_FOUND",
  "WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION",
]);

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

export function formatActivationRequestCreateFieldError(
  message: string | undefined,
  translate: (key: string) => string,
) {
  return translateFieldError(message, translate, CREATE_FIELD_ERROR_KEYS);
}

export function resolveActivationRequestCreateError(
  error: unknown,
  translate: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return translate("saveError");

  const details = error.details;
  const detailCode =
    details && typeof details === "object" && "code" in details
      ? String(details.code)
      : undefined;

  if (detailCode && CREATE_API_ERROR_CODES.has(detailCode)) {
    return translate(`apiErrors.${detailCode}`);
  }

  return error.message || translate("saveError");
}

export function toAdminActivationRequestBody({
  product,
  provinces,
  values,
  wards,
}: {
  product: ProductResponse | null;
  provinces: VietnamProvince[];
  values: WarrantyActivationRequestCreateFormValues;
  wards: VietnamWard[];
}): CreateAdminWarrantyActivationRequestBody {
  const province = provinces.find(
    (item) => String(item.code) === values.provinceCode,
  );
  const ward = wards.find((item) => String(item.code) === values.wardCode);

  return {
    addressDetail: values.addressDetail.trim(),
    brand: product?.brand ?? undefined,
    customerBirthdate: values.customerBirthdate || undefined,
    customerEmail: values.customerEmail.trim(),
    customerName: values.customerName.trim(),
    customerPhone: values.customerPhone.trim(),
    manufactureYear: product?.manufactureYear ?? undefined,
    model: product?.model ?? undefined,
    note: values.note.trim() || undefined,
    productId: values.productId,
    productName: product?.name ?? values.productName.trim(),
    provinceCode: values.provinceCode,
    provinceName: province?.name ?? "",
    serialNumber: product?.serialNumber ?? undefined,
    wardCode: values.wardCode,
    wardName: ward?.name ?? "",
  };
}
