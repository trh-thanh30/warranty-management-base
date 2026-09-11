import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  buildWarrantyClaimListQuery,
  buildWarrantyClaimProductQuery,
  buildWarrantyClaimWarrantyQuery,
  flattenWarrantyClaimOptions,
  getWarrantyClaimRequesterPrefill,
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

test("requester prefill reuses the hydrated customer for another product with the same owner", () => {
  assert.deepEqual(
    getWarrantyClaimRequesterPrefill(
      {
        customerId: "customer-1",
        fullName: "Nguyen Van Hung",
      },
      {
        fullName: "Nguyen Van Hung",
        id: "customer-1",
        phone: "0985844298",
      },
    ),
    {
      requesterName: "Nguyen Van Hung",
      requesterPhone: "0985844298",
    },
  );
});

test("requester prefill does not reuse a cached customer from another owner", () => {
  assert.deepEqual(
    getWarrantyClaimRequesterPrefill(
      {
        customerId: "customer-2",
        fullName: "Nguyen Van Hung",
      },
      {
        fullName: "Nguyen Van Hung",
        id: "customer-1",
        phone: "0985844298",
      },
    ),
    {
      requesterName: "Nguyen Van Hung",
      requesterPhone: "",
    },
  );
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

test("claim product selector requests only claim-eligible products", () => {
  assert.deepEqual(buildWarrantyClaimProductQuery("  Đèn  ", "category-id"), {
    categoryId: "category-id",
    claimEligible: "true",
    limit: 20,
    search: "Đèn",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  assert.deepEqual(buildWarrantyClaimProductQuery("   ", ""), {
    claimEligible: "true",
    limit: 20,
    search: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
});

test("claim warranty selector supports direct search and optional filters", () => {
  assert.deepEqual(buildWarrantyClaimWarrantyQuery("  WM-2026-ABCDEF  "), {
    claimEligible: "true",
    includeOpenClaim: "true",
    limit: 20,
    search: "WM-2026-ABCDEF",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  assert.deepEqual(
    buildWarrantyClaimWarrantyQuery("  Nguyễn Văn A  ", {
      categoryId: "category-id",
      productId: "product-id",
    }),
    {
      categoryId: "category-id",
      claimEligible: "true",
      includeOpenClaim: "true",
      limit: 20,
      productId: "product-id",
      search: "Nguyễn Văn A",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  );
});

test("claim warranty selector includes blocked claims when opened or searched", () => {
  assert.equal(
    buildWarrantyClaimWarrantyQuery("WM-2026-ABCDEF").includeOpenClaim,
    "true",
  );
  assert.equal(
    buildWarrantyClaimWarrantyQuery("WM-2026-").includeOpenClaim,
    "true",
  );
  assert.equal(
    buildWarrantyClaimWarrantyQuery("Nguyen Van A").includeOpenClaim,
    "true",
  );
  assert.equal(buildWarrantyClaimWarrantyQuery("").includeOpenClaim, "true");
});

test("claim warranty options preserve warranties sharing one product", () => {
  const result = flattenWarrantyClaimOptions([
    {
      items: [
        { id: "warranty-a", productId: "product-1" },
        { id: "warranty-b", productId: "product-1" },
      ],
    },
    {
      items: [
        { id: "warranty-a", productId: "product-1" },
        { id: "warranty-c", productId: "product-2" },
      ],
    },
  ]);

  assert.deepEqual(
    result.map((warranty) => warranty.id),
    ["warranty-a", "warranty-b", "warranty-c"],
  );
});

test("claim directory uses one search term for claim and warranty codes", () => {
  assert.deepEqual(
    buildWarrantyClaimListQuery(
      {
        dateFrom: "",
        dateTo: "",
        isOverdue: "ALL",
        priority: "ALL",
        serviceCenter: "ALL",
        status: "ALL",
      },
      "  WM-2026-ABC  ",
      1,
      10,
      "createdAt",
      "desc",
    ),
    {
      assignmentStatus: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      isOverdue: undefined,
      limit: 10,
      page: 1,
      priority: undefined,
      search: "WM-2026-ABC",
      serviceCenterId: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: undefined,
    },
  );

  assert.equal(
    buildWarrantyClaimListQuery(
      {
        dateFrom: "",
        dateTo: "",
        isOverdue: "ALL",
        priority: "ALL",
        serviceCenter: "UNASSIGNED",
        status: "ALL",
      },
      "",
      1,
      10,
      "createdAt",
      "desc",
    ).assignmentStatus,
    "UNASSIGNED",
  );
});
