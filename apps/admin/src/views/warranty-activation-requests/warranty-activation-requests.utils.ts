import {
  getLocalizedApiError,
  type ApiErrorTranslator,
} from "@/src/lib/localized-api-error.utils";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import { translateFieldError } from "@/src/utils";
import { compactActivationInputValues } from "@/src/utils/category-activation-fields";
import {
  HttpClientError,
  formatDate,
  type CategoryActivationFieldConfig,
  type CategoryResponse,
  type CreateAdminWarrantyActivationRequestBody,
  type DealerResponse,
  type ListWarrantyActivationRequestsQuery,
  type ProductResponse,
  type WarrantyActivationRequestSummary,
} from "@repo/shared";
import { getActivationProductDisplayName } from "./warranty-activation-request-product.utils";
import type {
  WarrantyActivationRequestCreateFormValues,
  WarrantyActivationRequestDirectoryFilters,
} from "./warranty-activation-requests.types";

const CREATE_FIELD_ERROR_KEYS = new Set([
  "addressAdministrativeUnitNotAllowed",
  "addressRequired",
  "categoryRequired",
  "customerRequired",
  "customerNameRequired",
  "emailInvalid",
  "installedAtFuture",
  "installedAtInvalid",
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
  "ACTIVATION_REQUEST_NOT_PENDING",
  "ACTIVATION_CODE_PRODUCT_MISMATCH",
  "ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED",
  "ACTIVATION_CODE_INVALID_OR_EXPIRED",
  "CUSTOMER_OWNER_MISMATCH",
  "PRODUCT_NOT_ELIGIBLE_FOR_ACTIVATION_REQUEST",
  "PRODUCT_CATEGORY_MISMATCH",
  "QUICK_DEALER_REQUIRED_FIELDS",
  "DEALER_PHONE_INACTIVE",
  "PRODUCT_WARRANTY_NOT_FOUND",
  "WARRANTY_CODE_NOT_FOUND",
  "WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION",
]);

export function formatActivationRequestDate(
  value: string | null,
  locale: string,
) {
  return formatDate(value, { locale, showTime: true });
}

export function formatActivationRequestDateTimeInput(
  value: string | null | undefined,
) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildWarrantyActivationRequestListQuery({
  dateFrom,
  dateTo,
  limit,
  page,
  search,
  sortBy,
  sortOrder,
  status,
}: {
  dateFrom: string;
  dateTo: string;
  limit: number;
  page: number;
  search: string;
  sortBy?: ListWarrantyActivationRequestsQuery["sortBy"];
  sortOrder: "asc" | "desc";
  status: WarrantyActivationRequestDirectoryFilters["status"];
}): ListWarrantyActivationRequestsQuery {
  return omitUndefined({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit,
    page,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
    status: status === "ALL" ? undefined : status,
  });
}

export function formatActivationRequestCustomer(
  request: WarrantyActivationRequestSummary,
) {
  return [request.customerName, request.customerPhone]
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

export function resolveScopedProductSearch(
  categoryId: string,
  search: { categoryId: string; value: string },
) {
  if (!categoryId || search.categoryId !== categoryId) return undefined;

  return search.value.trim() || undefined;
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
  apiErrors?: ApiErrorTranslator,
) {
  if (!(error instanceof HttpClientError)) return translate("saveError");

  const details = error.details;
  const detailCode =
    details && typeof details === "object" && "code" in details
      ? String(details.code)
      : undefined;

  if (detailCode && CREATE_API_ERROR_CODES.has(detailCode)) {
    if (apiErrors?.has?.(detailCode)) return apiErrors(detailCode);

    return translate(`apiErrors.${detailCode}`);
  }

  return getLocalizedApiError(error, translate, { apiErrors });
}

export function toAdminActivationRequestBody({
  activationFields = [],
  activationCodeIdsByPosition = {},
  activationProducts = {},
  product,
  existingMetadata,
  provinces,
  values,
  wards,
}: {
  activationFields?: CategoryActivationFieldConfig[];
  activationCodeIdsByPosition?: Record<string, string>;
  activationProducts?: Record<string, ProductResponse>;
  product: ProductResponse | null;
  existingMetadata?: Record<string, unknown> | null;
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
  const activationMetadata = buildEditableActivationMetadata(
    existingMetadata,
    activationInputValues,
  );
  const items = buildActivationRequestItems(
    activationFields,
    activationProducts,
    activationCodeIdsByPosition,
  );
  const primaryProduct =
    product ?? Object.values(activationProducts)[0] ?? null;
  const installedAt = values.installedAt.trim();

  return omitUndefined({
    activationCodeId: values.activationCodeId || undefined,
    addressDetail: values.addressDetail.trim(),
    brand: primaryProduct?.brand ?? undefined,
    categoryId: values.categoryId || undefined,
    customerBirthdate: values.customerBirthdate || undefined,
    customerEmail: values.customerEmail.trim() || undefined,
    customerId: values.customerId,
    customerName: values.customerName.trim(),
    customerPhone: values.customerPhone.trim(),
    dealerAddress: values.dealerAddress.trim() || undefined,
    dealerDistrict: values.dealerDistrict.trim() || undefined,
    dealerId: values.dealerId || undefined,
    dealerName: values.dealerName.trim() || undefined,
    dealerPhone: values.dealerPhone.trim() || undefined,
    dealerProvince: values.dealerProvince.trim() || undefined,
    filmItems: buildFilmItems(values, activationInputValues),
    items: items.length > 0 ? items : undefined,
    installedAt: installedAt ? new Date(installedAt).toISOString() : undefined,
    manufactureYear: primaryProduct?.modelYear ?? undefined,
    model: primaryProduct?.model ?? undefined,
    metadata: activationMetadata,
    note: values.note.trim() || undefined,
    productId: items.length > 0 ? undefined : values.productId || undefined,
    productName:
      (primaryProduct ? getActivationProductDisplayName(primaryProduct) : "") ||
      values.productName.trim() ||
      undefined,
    provinceCode: values.provinceCode,
    provinceName: province?.name ?? "",
    salesName: values.salesName.trim() || undefined,
    vehicleModel: values.vehicleModel.trim() || undefined,
    vehiclePlate: values.vehiclePlate.trim() || undefined,
    wardCode: values.wardCode,
    wardName: ward?.name ?? "",
  });
}

function buildEditableActivationMetadata(
  existingMetadata: Record<string, unknown> | null | undefined,
  activationInputValues: Record<string, string>,
) {
  const metadata = { ...(existingMetadata ?? {}) };
  delete metadata.activationInputValues;
  delete metadata.dealer;
  delete metadata.filmItems;
  delete metadata.productId;
  delete metadata.source;
  delete metadata.warrantyId;

  if (Object.keys(activationInputValues).length > 0) {
    metadata.activationInputValues = activationInputValues;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export function buildActivationRequestItems(
  fields: CategoryActivationFieldConfig[],
  productsByPosition: Record<string, ProductResponse>,
  activationCodeIdsByPosition: Record<string, string> = {},
) {
  return fields.flatMap((field) => {
    if (field.type !== "PRODUCT_SELECT") return [];
    const selectedProduct = productsByPosition[field.key];
    if (!selectedProduct) return [];

    return [
      omitUndefined({
        activationCodeId: activationCodeIdsByPosition[field.key],
        activationFieldId: field.id,
        positionKey: field.key,
        productId: selectedProduct.id,
      }),
    ];
  });
}

export function getUnavailableActivationProductIds(
  productsByPosition: Record<string, ProductResponse>,
  currentPositionKey: string,
) {
  return new Set(
    Object.entries(productsByPosition)
      .filter(([positionKey]) => positionKey !== currentPositionKey)
      .map(([, product]) => product.id),
  );
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
