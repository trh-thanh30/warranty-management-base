import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantyActivationFormSchema } from "./warranty-activation-form.schema.ts";

const schema = createWarrantyActivationFormSchema({
  addressRequired: "address required",
  customerEmailInvalid: "email invalid",
  customerEmailRequired: "email required",
  customerNameInvalid: "name invalid",
  customerPhoneInvalid: "phone invalid",
  provinceRequired: "province required",
  vehiclePlateInvalid: "plate invalid",
  wardRequired: "ward required",
  activationCodeInvalid: "code invalid",
});

const validValues = {
  addressDetail: "Khu phố Hoàng Xá, Thị xã Thuận Thành",
  customerEmail: "customer@example.com",
  customerName: "Nguyễn Văn A",
  customerPhone: "0901234567",
  provinceCode: "27",
  vehiclePlate: "30A-12345",
  wardCode: "09442",
  activationCode: "SP-ABCDEF123456",
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
