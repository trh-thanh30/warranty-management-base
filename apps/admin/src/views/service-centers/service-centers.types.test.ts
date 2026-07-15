import assert from "node:assert/strict";
import test from "node:test";
import { serviceCenterFormSchema } from "./service-centers.types.ts";

const validForm = {
  address: "123 Tran Duy Hung",
  district: "Cau Giay",
  email: "center@example.com",
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
