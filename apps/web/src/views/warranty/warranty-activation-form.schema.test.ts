import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantyActivationFormSchema } from "./warranty-activation-form.schema.ts";

const schema = createWarrantyActivationFormSchema({
  addressRequired: "address required",
  customerEmailInvalid: "email invalid",
  customerEmailRequired: "email required",
  customerNameInvalid: "name invalid",
  customerPhoneInvalid: "phone invalid",
  installedAtFuture: "installation date future",
  installedAtInvalid: "installation date invalid",
  installedAtRequired: "installation date required",
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
  installedAt: "2026-09-09T14:30",
  provinceCode: "27",
  vehiclePlate: "30A-12345",
  wardCode: "09442",
  warrantyCode: "WM-2026-ABCDE",
};

test("public activation accepts previously valid Vietnamese address details", () => {
  for (const addressDetail of [
    "123 Nguyễn Trãi, Phường 1",
    "Khu phố Hoàng Xá, Xã A, Tỉnh B",
    "Số 10, Thành phố Tây Hồ",
    "123 Nguyen Trai, Phuong 1",
    "Khu phố Hoàng Xá, Thị xã Thuận Thành",
    "Số 10 Tỉnh lộ 282",
  ]) {
    assert.equal(
      schema.safeParse({ ...validValues, addressDetail }).success,
      true,
    );
  }
});

test("public activation requires a valid installation date that is not in the future", () => {
  for (const [installedAt, expectedMessage] of [
    ["", "installation date required"],
    ["not-a-date", "installation date invalid"],
    [new Date(Date.now() + 60_000).toISOString(), "installation date future"],
  ] as const) {
    const result = schema.safeParse({ ...validValues, installedAt });

    assert.equal(result.success, false);
    if (result.success) continue;
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path[0] === "installedAt" && issue.message === expectedMessage,
      ),
      true,
    );
  }
});
