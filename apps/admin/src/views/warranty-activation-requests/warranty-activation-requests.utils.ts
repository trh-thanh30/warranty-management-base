import {
  HttpClientError,
  type CategoryResponse,
  type CreateAdminWarrantyActivationRequestBody,
  type DealerResponse,
  type ProductResponse,
  type WarrantyActivationRequestSummary,
} from "@repo/shared";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import { translateFieldError } from "@/src/utils";
import { compactActivationInputValues } from "@/src/utils/category-activation-fields";
import type { WarrantyActivationRequestCreateFormValues } from "./warranty-activation-requests.types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const CREATE_FIELD_ERROR_KEYS = new Set([
  "addressRequired",
  "categoryRequired",
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
  "PRODUCT_CATEGORY_MISMATCH",
  "QUICK_DEALER_REQUIRED_FIELDS",
  "DEALER_PHONE_INACTIVE",
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

export function formatDealerSearchOption(dealer: DealerResponse) {
  return [dealer.name, dealer.province, dealer.phone]
    .filter(Boolean)
    .join(" · ");
}

export function filterActivationRequestCategories(
  categories: CategoryResponse[],
  search: string,
) {
  const keyword = normalizeSearchKeyword(search);
  if (!keyword) return categories;

  return categories.filter((category) =>
    [category.name, category.code, category.slug].some((value) =>
      normalizeSearchKeyword(value ?? "").includes(keyword),
    ),
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
  const activationInputValues = compactActivationInputValues(
    values.categoryInputValues,
  );
  const activationMetadata =
    Object.keys(activationInputValues).length > 0
      ? { activationInputValues }
      : undefined;

  return omitUndefined({
    addressDetail: values.addressDetail.trim(),
    brand: product?.brand ?? undefined,
    categoryId: values.categoryId,
    customerBirthdate: values.customerBirthdate || undefined,
    customerEmail: values.customerEmail.trim() || undefined,
    customerName: values.customerName.trim(),
    customerPhone: values.customerPhone.trim(),
    dealerAddress: values.dealerAddress.trim() || undefined,
    dealerDistrict: values.dealerDistrict.trim() || undefined,
    dealerId: values.dealerId || undefined,
    dealerName: values.dealerName.trim() || undefined,
    dealerPhone: values.dealerPhone.trim() || undefined,
    dealerProvince: values.dealerProvince.trim() || undefined,
    filmItems: buildFilmItems(values, activationInputValues),
    manufactureYear: product?.manufactureYear ?? undefined,
    model: product?.model ?? undefined,
    metadata: activationMetadata,
    note: values.note.trim() || undefined,
    productId: values.productId,
    productName: product?.name ?? values.productName.trim(),
    provinceCode: values.provinceCode,
    provinceName: province?.name ?? "",
    salesName: values.salesName.trim() || undefined,
    serialNumber: product?.serialNumber ?? undefined,
    vehicleModel: values.vehicleModel.trim() || undefined,
    vehiclePlate: values.vehiclePlate.trim() || undefined,
    wardCode: values.wardCode,
    wardName: ward?.name ?? "",
  });
}

function buildFilmItems(
  values: WarrantyActivationRequestCreateFormValues,
  activationInputValues: Record<string, string>,
) {
  const filmItems = {
    frontLeftSide:
      activationInputValues.frontLeftSide ?? values.filmFrontLeftSide.trim(),
    frontRightSide:
      activationInputValues.frontRightSide ?? values.filmFrontRightSide.trim(),
    rearGlass: activationInputValues.rearGlass ?? values.filmRearGlass.trim(),
    rearLeftSide:
      activationInputValues.rearLeftSide ?? values.filmRearLeftSide.trim(),
    rearRightSide:
      activationInputValues.rearRightSide ?? values.filmRearRightSide.trim(),
    sunroof: activationInputValues.sunroof ?? values.filmSunroof.trim(),
    windshield:
      activationInputValues.windshield ?? values.filmWindshield.trim(),
  };
  const compact = Object.fromEntries(
    Object.entries(filmItems).filter(([, value]) => Boolean(value)),
  );

  return Object.keys(compact).length > 0 ? compact : undefined;
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}

function normalizeSearchKeyword(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
