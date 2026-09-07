import assert from "node:assert/strict";
import test from "node:test";
import { dealerFormSchema } from "./dealers.types.ts";

const validForm = {
  address: "12 Nguyen Trai",
  district: "Phuong Thanh Xuan",
  isActive: true,
  latitude: 21.028511,
  longitude: 105.804817,
  name: "Hanoi Dealer",
  phone: "0901234567",
  province: "Ha Noi",
  salesName: "Nguyen Van A",
};

test("dealer form allows an empty map location", () => {
  const result = dealerFormSchema.safeParse({
    ...validForm,
    latitude: Number.NaN,
    longitude: Number.NaN,
  });

  assert.equal(result.success, true);
});

test("dealer form rejects coordinates outside their valid ranges", () => {
  const result = dealerFormSchema.safeParse({
    ...validForm,
    latitude: 91,
    longitude: -181,
  });

  assert.equal(result.success, false);
});

test("dealer form accepts valid coordinates", () => {
  assert.equal(dealerFormSchema.safeParse(validForm).success, true);
});
