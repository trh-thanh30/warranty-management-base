import assert from "node:assert/strict";
import test from "node:test";
import { serviceCenterFormSchema } from "./service-centers.types.ts";

const validForm = {
  address: "123 Tran Duy Hung",
  district: "Phuong Hai Chau",
  email: "center@example.com",
  isActive: true,
  latitude: 16.054407,
  longitude: 108.202164,
  name: "Hanoi Warranty Center",
  phone: "0901234567",
  province: "Ha Noi",
};

test("service center form rejects non-phone text in the phone field", () => {
  const result = serviceCenterFormSchema.safeParse({
    ...validForm,
    phone: "danangservice@examplecom",
  });

  assert.equal(result.success, false);
});

test("service center form accepts common formatted phone numbers", () => {
  const result = serviceCenterFormSchema.safeParse({
    ...validForm,
    phone: "+84 (90) 123-4567",
  });

  assert.equal(result.success, true);
});

test("service center form requires a ward or commune", () => {
  const result = serviceCenterFormSchema.safeParse({
    ...validForm,
    district: "",
  });

  assert.equal(result.success, false);
});

test("service center form requires a map location", () => {
  const result = serviceCenterFormSchema.safeParse({
    ...validForm,
    latitude: Number.NaN,
    longitude: Number.NaN,
  });

  assert.equal(result.success, false);
});

test("service center form rejects coordinates outside their valid ranges", () => {
  const result = serviceCenterFormSchema.safeParse({
    ...validForm,
    latitude: -91,
    longitude: 181,
  });

  assert.equal(result.success, false);
});

test("service center form accepts valid coordinates", () => {
  assert.equal(serviceCenterFormSchema.safeParse(validForm).success, true);
});
