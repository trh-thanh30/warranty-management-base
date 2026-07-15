import assert from "node:assert/strict";
import test from "node:test";
import { validateWarrantyClaimAttachment } from "./warranty-claims.utils.ts";

test("claim attachment validation rejects unsupported files", () => {
  assert.equal(
    validateWarrantyClaimAttachment({
      size: 1024,
      type: "application/x-msdownload",
    }),
    "attachmentTypeInvalid",
  );
});

test("claim attachment validation rejects files larger than 10 MB", () => {
  assert.equal(
    validateWarrantyClaimAttachment({
      size: 10 * 1024 * 1024 + 1,
      type: "application/pdf",
    }),
    "attachmentTooLarge",
  );
});

test("claim attachment validation accepts supported files within the limit", () => {
  assert.equal(
    validateWarrantyClaimAttachment({
      size: 10 * 1024 * 1024,
      type: "image/jpeg",
    }),
    null,
  );
});
