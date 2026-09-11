import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantyClaimsService } from "./create-warranty-claims.service.ts";
import type { WarrantyClaimsHttpClient } from "./warranty-claims.types.ts";

const claim = {
  id: "claim-id",
  claimCode: "CLM000001",
  warrantyId: "warranty-id",
  productId: "product-id",
  customerId: "customer-id",
  warrantyCode: "WM-2026-ABCDEF",
  requesterName: "Nguyen Van A",
  requesterPhone: "0900000000",
  issueTitle: "Battery issue",
  issueDetail: "Cannot start",
  status: "SUBMITTED",
  priority: "NORMAL",
  dueAt: "2026-07-20T00:00:00.000Z",
  slaBreachedAt: null,
  metadata: null,
  submittedAt: "2026-07-14T00:00:00.000Z",
  resolvedAt: null,
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
  product: null,
  warranty: null,
  customer: null,
  serviceCenter: null,
  statusHistory: [],
  attachments: [],
};

test("creates a warranty claim with required image and video evidence", async () => {
  const calls: Array<{ body: unknown; config?: unknown; url: string }> = [];
  const http = {
    async post(url: string, body: unknown, config?: unknown) {
      calls.push({ body, config, url });
      return { data: { success: true, data: claim } };
    },
  };
  const image = new File(["image"], "damage.webp", { type: "image/webp" });
  const video = new File(["video"], "damage.mp4", { type: "video/mp4" });
  const body = {
    issueTitle: "Kinh bi bong",
    requesterName: "Nguyen Van A",
    requesterPhone: "0901234567",
    warrantyCode: "WM-2026-ABCDEF",
  };

  const result = await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).createWarrantyClaim(body, [image, video]);

  assert.equal(result, claim);
  assert.equal(calls[0]?.url, "/warranty-claims");
  assert.ok(calls[0]?.body instanceof FormData);
  assert.equal(calls[0].body.get("warrantyCode"), body.warrantyCode);
  assert.deepEqual(calls[0].body.getAll("attachments"), [image, video]);
  assert.deepEqual(calls[0]?.config, { timeout: 120_000 });
});

test("warranty claim directory requests paginated claims with filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [claim],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).listWarrantyClaims({
    assignmentStatus: "UNASSIGNED",
    isOverdue: "true",
    page: 1,
    priority: "HIGH",
    search: "battery",
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "SUBMITTED",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims",
      config: {
        params: {
          assignmentStatus: "UNASSIGNED",
          isOverdue: "true",
          page: 1,
          priority: "HIGH",
          search: "battery",
          sortBy: "createdAt",
          sortOrder: "desc",
          status: "SUBMITTED",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("warranty claim metrics calls summary endpoint", async () => {
  const calls: unknown[] = [];
  const response = {
    total: 1,
    createdToday: 1,
    createdThisMonth: 1,
    overdue: 0,
    averageResolutionHours: null,
    byStatus: [],
    byPriority: [],
    byServiceCenter: [],
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).getMetrics({ assignmentStatus: "UNASSIGNED" });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/metrics/summary",
      config: { params: { assignmentStatus: "UNASSIGNED" } },
    },
  ]);
  assert.deepEqual(result, response);
});

test("exports warranty claims with the current directory filters", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["export"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).exportWarrantyClaims({
    assignmentStatus: "UNASSIGNED",
    isOverdue: "true",
    priority: "HIGH",
    status: "REVIEWING",
  });

  assert.equal(result, blob);
  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/export",
      config: {
        params: {
          assignmentStatus: "UNASSIGNED",
          isOverdue: "true",
          priority: "HIGH",
          status: "REVIEWING",
        },
        responseType: "blob",
      },
    },
  ]);
});

test("updating claim status uses status endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: claim } };
    },
  };

  await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).updateStatus("claim-id", {
    note: "Start review",
    status: "REVIEWING",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/claim-id/status",
      body: {
        note: "Start review",
        status: "REVIEWING",
      },
    },
  ]);
});

test("completing a claim immediately uses the dedicated endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: claim } };
    },
  };

  await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).completeWarrantyClaim("claim-id", {
    note: "Resolved at service center",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/claim-id/complete",
      body: { note: "Resolved at service center" },
    },
  ]);
});

test("assigning service center uses assignment endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: claim } };
    },
  };

  await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).assignServiceCenter("claim-id", {
    note: "Nearest center",
    serviceCenterId: "service-center-id",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/claim-id/assign-service-center",
      body: {
        note: "Nearest center",
        serviceCenterId: "service-center-id",
      },
    },
  ]);
});

test("updating claim priority uses priority endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: claim } };
    },
  };

  await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).updatePriority("claim-id", {
    dueAt: "2026-07-20",
    priority: "URGENT",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/claim-id/priority",
      body: {
        dueAt: "2026-07-20",
        priority: "URGENT",
      },
    },
  ]);
});

test("linking an uploaded asset attaches it to the claim", async () => {
  const calls: unknown[] = [];
  const attachment = {
    id: "asset-id",
    originalName: "invoice.pdf",
    filename: "stored-invoice.pdf",
    mimeType: "application/pdf",
    size: 1024,
    url: "http://localhost:4100/cdn/invoice.pdf",
    type: "DOCUMENT",
    accessType: "PUBLIC",
    uploadedById: "user-id",
    createdAt: "2026-07-15T00:00:00.000Z",
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: attachment } };
    },
  };

  const result = await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).linkAttachment("claim-id", "asset-id");

  assert.deepEqual(calls, [
    {
      url: "/warranty-claims/claim-id/assets",
      body: { assetId: "asset-id" },
    },
  ]);
  assert.deepEqual(result, attachment);
});

test("unlinking an attachment removes only its claim link", async () => {
  const calls: unknown[] = [];
  const http = {
    async delete(url: string) {
      calls.push({ url });
      return { data: { success: true, data: { success: true } } };
    },
  };

  await createWarrantyClaimsService(
    http as unknown as WarrantyClaimsHttpClient,
  ).unlinkAttachment("claim-id", "asset-id");

  assert.deepEqual(calls, [
    { url: "/warranty-claims/claim-id/assets/asset-id" },
  ]);
});
