import assert from "node:assert/strict";
import test from "node:test";
import {
  HttpClientError,
  type CategoryResponse,
  type ProductResponse,
} from "@repo/shared";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import {
  buildActivationRequestItems,
  filterActivationRequestCategories,
  formatActivationRequestCreateFieldError,
  formatDealerSearchOption,
  resolveActivationRequestCreateError,
  resolveScopedProductSearch,
  getUnavailableActivationProductIds,
  toAdminActivationRequestBody,
} from "./warranty-activation-requests.utils.ts";
import type { WarrantyActivationRequestCreateFormValues } from "./warranty-activation-requests.types.ts";

const provinces = [{ code: 79, name: "TP HCM" }] as VietnamProvince[];
const wards = [{ code: 1, name: "Phuong Sai Gon" }] as VietnamWard[];
const baseValues: WarrantyActivationRequestCreateFormValues = {
  addressDetail: "",
  activationProductIds: {},
  categoryId: "",
  categoryInputValues: {},
  customerBirthdate: "",
  customerEmail: "",
  customerName: "",
  customerPhone: "",
  dealerAddress: "",
  dealerDistrict: "",
  dealerId: "",
  dealerName: "",
  dealerPhone: "",
  dealerProvince: "",
  filmFrontLeftSide: "",
  filmFrontRightSide: "",
  filmRearGlass: "",
  filmRearLeftSide: "",
  filmRearRightSide: "",
  filmSunroof: "",
  filmWindshield: "",
  note: "",
  productId: "",
  productName: "",
  provinceCode: "",
  salesName: "",
  vehicleModel: "",
  vehiclePlate: "",
  wardCode: "",
  warrantyCode: "",
};

test("admin activation request body combines form and selected product data", () => {
  const product = {
    brand: "Black Label",
    id: "product-1",
    modelYear: 2026,
    model: "Premium",
    name: "Film cach nhiet",
    serialNumber: "SN-001",
  } as unknown as ProductResponse;

  assert.deepEqual(
    toAdminActivationRequestBody({
      product,
      provinces,
      values: {
        ...baseValues,
        addressDetail: " 12 Nguyen Hue ",
        categoryId: "category-1",
        categoryInputValues: {
          customNote: " Gia tri rieng ",
          windshield: " FILM-001 ",
        },
        customerBirthdate: "",
        customerEmail: " an@example.com ",
        customerName: " Nguyen Van An ",
        customerPhone: " 0901234567 ",
        note: " ",
        productId: "product-1",
        productName: "Film cach nhiet",
        provinceCode: "79",
        wardCode: "1",
        vehicleModel: " Camry ",
        vehiclePlate: " 30A-12345 ",
        warrantyCode: "",
      },
      wards,
    }),
    {
      addressDetail: "12 Nguyen Hue",
      brand: "Black Label",
      categoryId: "category-1",
      customerEmail: "an@example.com",
      customerName: "Nguyen Van An",
      customerPhone: "0901234567",
      filmItems: {
        windshield: "FILM-001",
      },
      manufactureYear: 2026,
      metadata: {
        activationInputValues: {
          customNote: "Gia tri rieng",
          windshield: "FILM-001",
        },
      },
      model: "Premium",
      productId: "product-1",
      productName: "Film cach nhiet",
      provinceCode: "79",
      provinceName: "TP HCM",
      serialNumber: "SN-001",
      vehicleModel: "Camry",
      vehiclePlate: "30A-12345",
      wardCode: "1",
      wardName: "Phuong Sai Gon",
    },
  );
});

test("admin activation request body maps physical products to configured positions", () => {
  const products = {
    rearGlass: { id: "product-2" } as ProductResponse,
    windshield: { id: "product-1" } as ProductResponse,
  };
  const activationFields = [
    {
      id: "field-1",
      key: "windshield",
      label: "Kinh lai",
      type: "PRODUCT_SELECT" as const,
    },
    {
      id: "field-2",
      key: "rearGlass",
      label: "Kinh lung",
      type: "PRODUCT_SELECT" as const,
    },
  ];

  assert.deepEqual(buildActivationRequestItems(activationFields, products), [
    {
      activationFieldId: "field-1",
      positionKey: "windshield",
      productId: "product-1",
    },
    {
      activationFieldId: "field-2",
      positionKey: "rearGlass",
      productId: "product-2",
    },
  ]);
  assert.deepEqual(
    toAdminActivationRequestBody({
      activationFields,
      activationProducts: products,
      product: null,
      provinces,
      values: {
        ...baseValues,
        addressDetail: "12 Nguyen Hue",
        activationProductIds: {
          rearGlass: "product-2",
          windshield: "product-1",
        },
        categoryId: "category-1",
        customerName: "Nguyen Van An",
        customerPhone: "0901234567",
        provinceCode: "79",
        wardCode: "1",
      },
      wards,
    }).items,
    [
      {
        activationFieldId: "field-1",
        positionKey: "windshield",
        productId: "product-1",
      },
      {
        activationFieldId: "field-2",
        positionKey: "rearGlass",
        productId: "product-2",
      },
    ],
  );
});

test("product selectors exclude products selected in other positions", () => {
  assert.deepEqual(
    getUnavailableActivationProductIds(
      {
        rearGlass: { id: "product-2" } as ProductResponse,
        windshield: { id: "product-1" } as ProductResponse,
      },
      "rearGlass",
    ),
    new Set(["product-1"]),
  );
});

test("activation request helpers translate known validation and API codes", () => {
  const translate = (key: string) => `translated:${key}`;
  const error = new HttpClientError({
    details: { code: "PRODUCT_WARRANTY_NOT_FOUND" },
    isNetworkError: false,
    message: "Not found",
  });

  assert.equal(
    formatActivationRequestCreateFieldError("productRequired", translate),
    "translated:productRequired",
  );
  assert.equal(
    resolveActivationRequestCreateError(error, translate),
    "translated:apiErrors.PRODUCT_WARRANTY_NOT_FOUND",
  );
});

test("activation request category filter matches name, code, and slug without accents", () => {
  const categories = [
    {
      code: "FILM",
      name: "Film cách nhiệt ô tô Lexzenz Reflex Korea Film",
      slug: "film-cach-nhiet",
    },
    {
      code: "DASHCAM",
      name: "Camera hành trình Lexzenz Dashcam",
      slug: "camera-hanh-trinh",
    },
  ].map(
    (category, index) =>
      ({
        ...category,
        createdAt: "2026-07-24T00:00:00.000Z",
        description: null,
        icon: null,
        id: `category-${index + 1}`,
        imageUrl: null,
        isActive: true,
        metadata: null,
        order: index,
        parentId: null,
        type: "PRODUCT",
        updatedAt: "2026-07-24T00:00:00.000Z",
      }) satisfies CategoryResponse,
  );

  assert.deepEqual(
    filterActivationRequestCategories(categories, "cach nhiet").map(
      (category) => category.code,
    ),
    ["FILM"],
  );
  assert.deepEqual(
    filterActivationRequestCategories(categories, "dash").map(
      (category) => category.code,
    ),
    ["DASHCAM"],
  );
});

test("product search never leaks a debounced keyword into another category", () => {
  const staleSearch = {
    categoryId: "film-category",
    value: "ceramic",
  };

  assert.equal(
    resolveScopedProductSearch("dashcam-category", staleSearch),
    undefined,
  );
  assert.equal(
    resolveScopedProductSearch("film-category", staleSearch),
    "ceramic",
  );
  assert.equal(
    resolveScopedProductSearch("film-category", {
      categoryId: "film-category",
      value: "   ",
    }),
    undefined,
  );
});

test("activation request dealer option combines useful search labels", () => {
  assert.equal(
    formatDealerSearchOption({
      address: "12 Nguyen Trai",
      createdAt: "2026-07-24T00:00:00.000Z",
      district: null,
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=21.028511%2C105.804817",
      id: "dealer-1",
      isActive: true,
      latitude: 21.028511,
      longitude: 105.804817,
      metadata: null,
      name: "Đại lý Hà Nội",
      phone: "0901234567",
      province: "Thành phố Hà Nội",
      salesName: null,
      updatedAt: "2026-07-24T00:00:00.000Z",
    }),
    "Đại lý Hà Nội · Thành phố Hà Nội · 0901234567",
  );
});
