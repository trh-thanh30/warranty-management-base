import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError, type ProductResponse } from "@repo/shared";
import type {
  VietnamProvince,
  VietnamWard,
} from "@/src/services/locations/locations.types";
import {
  formatActivationRequestCreateFieldError,
  resolveActivationRequestCreateError,
  toAdminActivationRequestBody,
} from "./warranty-activation-requests.utils.ts";

const provinces = [{ code: 79, name: "TP HCM" }] as VietnamProvince[];
const wards = [{ code: 1, name: "Phuong Sai Gon" }] as VietnamWard[];

test("admin activation request body combines form and selected product data", () => {
  const product = {
    brand: "Black Label",
    id: "product-1",
    manufactureYear: 2026,
    model: "Premium",
    name: "Film cach nhiet",
    serialNumber: "SN-001",
  } as ProductResponse;

  assert.deepEqual(
    toAdminActivationRequestBody({
      product,
      provinces,
      values: {
        addressDetail: " 12 Nguyen Hue ",
        customerBirthdate: "",
        customerEmail: " an@example.com ",
        customerName: " Nguyen Van An ",
        customerPhone: " 0901234567 ",
        note: " ",
        productId: "product-1",
        productName: "Film cach nhiet",
        provinceCode: "79",
        wardCode: "1",
        warrantyCode: "",
      },
      wards,
    }),
    {
      addressDetail: "12 Nguyen Hue",
      brand: "Black Label",
      customerBirthdate: undefined,
      customerEmail: "an@example.com",
      customerName: "Nguyen Van An",
      customerPhone: "0901234567",
      manufactureYear: 2026,
      model: "Premium",
      note: undefined,
      productId: "product-1",
      productName: "Film cach nhiet",
      provinceCode: "79",
      provinceName: "TP HCM",
      serialNumber: "SN-001",
      wardCode: "1",
      wardName: "Phuong Sai Gon",
    },
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
