import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activationFormSource = readFileSync(
  new URL(
    "./components/create-warranty-activation-request-form-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const customerSummarySource = readFileSync(
  new URL("./components/selected-customer-summary-card.tsx", import.meta.url),
  "utf8",
);
const addressDialogSource = readFileSync(
  new URL(
    "../customers/components/edit-customer-address-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("activation form delegates customer address editing to the customer feature", () => {
  assert.doesNotMatch(
    activationFormSource,
    /id="create-activation-request-address"/,
  );
  assert.doesNotMatch(
    activationFormSource,
    /id="create-activation-request-province"/,
  );
  assert.doesNotMatch(
    activationFormSource,
    /id="create-activation-request-ward"/,
  );
  assert.match(activationFormSource, /<EditCustomerAddressDialog/);
  assert.match(customerSummarySource, /onEditAddress/);
  assert.match(customerSummarySource, /<Pencil/);
});

test("customer address dialog updates the customer-owned address", () => {
  assert.match(addressDialogSource, /useUpdateCustomer\(customer\?\.id/);
  assert.doesNotMatch(addressDialogSource, /id="edit-customer-address-detail"/);
  assert.match(
    addressDialogSource,
    /type="hidden" \{\.\.\.register\("addressDetail"\)\}/,
  );
  assert.match(addressDialogSource, /id="edit-customer-address-province"/);
  assert.match(addressDialogSource, /id="edit-customer-address-ward"/);
  assert.match(addressDialogSource, /loading=\{wardsQuery\.isLoading\}/);
});
