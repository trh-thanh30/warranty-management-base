import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantyActivationFormSchema } from "./warranty-activation-form.schema.ts";

const schema = createWarrantyActivationFormSchema({
  addressAdministrativeUnitNotAllowed: "address location error",
  addressRequired: "address required",
  customerEmailInvalid: "email invalid",
  customerEmailRequired: "email required",
  customerNameInvalid: "name invalid",
  customerPhoneInvalid: "phone invalid",
  provinceRequired: "province required",
  vehiclePlateInvalid: "plate invalid",
  wardRequired: "ward required",
  warrantyCodeInvalid: "code invalid",
});

const validValues = {
  addressDetail: "Khu phố Hoàng Xá, Thị xã Thuận Thành",
  customerEmail: "customer@example.com",
  customerName: "Nguyễn Văn A",
  customerPhone: "0901234567",
  provinceCode: "27",
  vehiclePlate: "30A-12345",
  wardCode: "09442",
  warrantyCode: "WM-2026-ABCDE",
};

test("public activation address detail rejects structured location units", () => {
  const result = schema.safeParse({
    ...validValues,
    addressDetail: "Khu phố Hoàng Xá, Xã A, Tỉnh B",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.error.issues[0]?.message, "address location error");
});

test("public activation address detail allows district and provincial roads", () => {
  for (const addressDetail of [
    "Khu phố Hoàng Xá, Thị xã Thuận Thành",
    "Số 10 Tỉnh lộ 282",
  ]) {
    assert.equal(
      schema.safeParse({ ...validValues, addressDetail }).success,
      true,
    );
  }
});
