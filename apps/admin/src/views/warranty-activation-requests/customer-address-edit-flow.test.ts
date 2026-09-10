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
const customerDialogSource = readFileSync(
  new URL(
    "./components/edit-activation-request-customer-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);
const formHookSource = readFileSync(
  new URL(
    "./hooks/use-create-warranty-activation-request-form.ts",
    import.meta.url,
  ),
  "utf8",
);
const formUtilsSource = readFileSync(
  new URL("./warranty-activation-requests.utils.ts", import.meta.url),
  "utf8",
);

test("activation form edits the complete request customer snapshot from the customer header", () => {
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
  assert.doesNotMatch(activationFormSource, /<EditCustomerAddressDialog/);
  assert.match(activationFormSource, /<EditActivationRequestCustomerDialog/);
  assert.match(customerSummarySource, /onEditCustomer/);
  assert.match(customerSummarySource, /titleAction=/);
  assert.match(customerSummarySource, /<Pencil/);
});

test("customer dialog reuses the customer form and makes profile synchronization optional", () => {
  assert.match(customerDialogSource, /<CustomerForm/);
  assert.match(customerDialogSource, /<Checkbox/);
  assert.match(customerDialogSource, /updateCustomerProfile/);
  assert.match(customerDialogSource, /canUpdateCustomerProfile/);
  assert.doesNotMatch(customerDialogSource, /useUpdateCustomer/);
});

test("customer dialog reports each synchronization choice with a distinct success toast", () => {
  assert.match(customerDialogSource, /useToast\(\)/);
  assert.match(customerDialogSource, /t\("customerSnapshotApplied"\)/);
  assert.match(customerDialogSource, /t\("customerProfileSyncSelected"\)/);
});

test("selected customer summary renders missing information with an italic label", () => {
  assert.match(customerSummarySource, /noInformation/);
  assert.match(customerSummarySource, /emptyLabel=/);
});

test("saving the activation request sends the selected customer synchronization policy", () => {
  assert.match(formHookSource, /updateCustomerSnapshot/);
  assert.match(formHookSource, /updateCustomerProfile/);
  assert.match(
    formUtilsSource,
    /updateCustomerProfile:\s*values\.updateCustomerProfile\s*\|\|\s*undefined/,
  );
});
