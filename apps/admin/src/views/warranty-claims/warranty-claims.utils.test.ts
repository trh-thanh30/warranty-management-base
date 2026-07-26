import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getWarrantyClaimRequesterValues,
  getStatusBadgeVariant,
  resolveWarrantyClaimCreateError,
  toCreateWarrantyClaimBody,
  translateWarrantyClaimCreateFieldError,
  validateWarrantyClaimAttachment,
} from "./warranty-claims.utils.ts";
import { warrantyClaimCreateFormSchema } from "./warranty-claims.types.ts";

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

test("create claim body trims required requester fields and optional detail", () => {
  assert.deepEqual(
    toCreateWarrantyClaimBody({
      issueDetail: " ",
      issueTitle: "  Kinh bi bong  ",
      productId: "product-1",
      requesterName: " Nguyen Van A ",
      requesterPhone: " 0901234567 ",
      warrantyCode: " wm-2026-test ",
    }),
    {
      issueDetail: undefined,
      issueTitle: "Kinh bi bong",
      requesterName: "Nguyen Van A",
      requesterPhone: "0901234567",
      warrantyCode: "WM-2026-TEST",
    },
  );
});

test("maps the selected product owner or customer to requester fields", () => {
  assert.deepEqual(
    getWarrantyClaimRequesterValues({
      fullName: "Nguyen Van A",
      phone: "0901234567",
    }),
    {
      requesterName: "Nguyen Van A",
      requesterPhone: "0901234567",
    },
  );
  assert.deepEqual(
    getWarrantyClaimRequesterValues({ fullName: "Nguyen Van B" }),
    {
      requesterName: "Nguyen Van B",
      requesterPhone: "",
    },
  );
  assert.deepEqual(getWarrantyClaimRequesterValues(null), {
    requesterName: "",
    requesterPhone: "",
  });
});

test("create claim schema requires requester name and phone", () => {
  const result = warrantyClaimCreateFormSchema.safeParse({
    issueDetail: "",
    issueTitle: "Kinh bi bong",
    productId: "product-1",
    requesterName: " ",
    requesterPhone: "",
    warrantyCode: "WM-2026-TEST",
  });

  assert.equal(result.success, false);
  if (result.success) return;

  assert.deepEqual(
    result.error.issues.map((issue) => issue.message),
    ["requesterNameRequired", "requesterPhoneRequired"],
  );
});

test("create claim field errors translate known validation keys", () => {
  assert.equal(
    translateWarrantyClaimCreateFieldError(
      "productRequired",
      (key) => `translated:${key}`,
    ),
    "translated:productRequired",
  );
  assert.equal(
    translateWarrantyClaimCreateFieldError(
      "Unexpected validation message",
      (key) => `translated:${key}`,
    ),
    "Unexpected validation message",
  );
});

test("create claim errors translate known API messages", () => {
  const error = new HttpClientError({
    isNetworkError: false,
    message: "Warranty not found",
  });

  assert.equal(
    resolveWarrantyClaimCreateError(error, (key) => `translated:${key}`),
    "translated:apiErrors.WARRANTY_CODE_NOT_FOUND",
  );
});

test("claim statuses use distinct semantic badge colors", () => {
  assert.equal(getStatusBadgeVariant("SUBMITTED"), "secondary");
  assert.equal(getStatusBadgeVariant("REVIEWING"), "info");
  assert.equal(getStatusBadgeVariant("APPROVED"), "accent");
  assert.equal(getStatusBadgeVariant("IN_REPAIR"), "warning");
  assert.equal(getStatusBadgeVariant("COMPLETED"), "success");
  assert.equal(getStatusBadgeVariant("REJECTED"), "destructive");
  assert.equal(getStatusBadgeVariant("CANCELLED"), "destructive");
});
