import assert from "node:assert/strict";
import test from "node:test";
import type { CustomerSummary } from "@repo/shared";
import { formatCustomerSearchOption } from "./customer.ts";

test("customer search option contains the common customer identifiers", () => {
  const customer = {
    customerCode: "CUS-001",
    email: "an@example.com",
    fullName: "Nguyen Van An",
    phone: "0901234567",
  } as CustomerSummary;

  assert.equal(
    formatCustomerSearchOption(customer),
    "Nguyen Van An · CUS-001 · 0901234567 · an@example.com",
  );
});
