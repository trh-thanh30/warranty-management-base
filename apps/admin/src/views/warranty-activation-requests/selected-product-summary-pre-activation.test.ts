import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cardSource = readFileSync(
  new URL("./components/selected-product-summary-card.tsx", import.meta.url),
  "utf8",
);
const formSource = readFileSync(
  new URL(
    "./components/create-warranty-activation-request-form-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const viMessages = JSON.parse(
  readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
);
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
);

test("pre-activation product summary shows category and product status", () => {
  assert.match(cardSource, /categoryName/);
  assert.match(cardSource, /productStatusLabel/);
  assert.match(formSource, /selectedProduct\.categoryRef\.name/);
  assert.match(formSource, /`productStatuses\.\$\{selectedProduct\.status\}`/);
});

test("pre-activation product summary does not show owner or warranty code", () => {
  assert.doesNotMatch(cardSource, /ownerName/);
  assert.doesNotMatch(cardSource, /warrantyCode/);
  assert.doesNotMatch(formSource, /currentOwner: t\("currentOwner"\)/);
  assert.doesNotMatch(formSource, /warrantyCodeLabel=\{t\("warrantyCode"\)\}/);
});

test("category and product status labels are translated", () => {
  for (const messages of [viMessages, enMessages]) {
    const translations = messages.WarrantyActivationRequestsAdmin;
    assert.equal(typeof translations.category, "string");
    assert.equal(typeof translations.productStatus, "string");
    assert.equal(typeof translations.productStatuses.ACTIVE, "string");
    assert.equal(typeof translations.productStatuses.INACTIVE, "string");
    assert.equal(typeof translations.productStatuses.DELETED, "string");
  }
});
