import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailView = readFileSync(
  new URL("./warranty-activation-request-detail.view.tsx", import.meta.url),
  "utf8",
);
const detailCard = readFileSync(
  new URL(
    "./components/warranty-activation-request-detail-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const itemTable = readFileSync(
  new URL("./components/activation-request-items-table.tsx", import.meta.url),
  "utf8",
);

test("request certificate actions remain available when request items exist", () => {
  assert.doesNotMatch(detailView, /!request\?\.items\?\.length/);
  assert.match(detailView, /actions\.viewCertificate\(request\)/);
  assert.match(detailView, /actions\.downloadCertificate\(request\)/);
  assert.match(detailCard, /<DetailSection title=\{t\("certificateInfo"\)\}>/);
});

test("view and download certificate actions use full width only on mobile", () => {
  assert.match(
    detailView,
    /<Button\b(?=[^>]*className="w-full sm:w-auto")(?=[^>]*onClick=\{\(\) => \{\s+void actions\.viewCertificate\(request\);)[^>]*>/,
  );
  assert.match(
    detailView,
    /<Button\b(?=[^>]*className="w-full sm:w-auto")(?=[^>]*onClick=\{\(\) => \{\s+void actions\.downloadCertificate\(request\);)[^>]*>/,
  );
});

test("request items do not expose certificate actions", () => {
  assert.doesNotMatch(detailView, /viewItemCertificate/);
  assert.doesNotMatch(detailView, /downloadItemCertificate/);
  assert.doesNotMatch(detailView, /resendItemCertificate/);
  assert.doesNotMatch(itemTable, /item\.certificate/);
  assert.doesNotMatch(itemTable, /onViewCertificate/);
  assert.doesNotMatch(itemTable, /onDownloadCertificate/);
  assert.doesNotMatch(itemTable, /onResendCertificate/);
});
