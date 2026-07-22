import assert from "node:assert/strict";
import test from "node:test";
import { createUsersService } from "./create-users.service.ts";
import type { UsersHttpClient } from "./users.types.ts";

test("staff directory always requests moderator accounts", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
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

  const result = await createUsersService(
    http as unknown as UsersHttpClient,
  ).listModerators({
    page: 2,
    search: "lan",
  });

  assert.deepEqual(calls, [
    {
      url: "/users",
      config: {
        params: {
          page: 2,
          search: "lan",
          role: "MODERATOR",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("creating staff relies on the generated temporary password response", async () => {
  const calls: unknown[] = [];
  const response = {
    temporaryPassword: "Abcd2345!xyz",
    user: {
      id: "moderator-id",
      email: "staff@example.com",
      username: "staff",
      fullName: "Staff Member",
      phone: null,
      avatarUrl: null,
      role: "MODERATOR",
      status: "ACTIVE",
      isVerified: true,
      createdAt: "2026-07-05T00:00:00.000Z",
      updatedAt: "2026-07-05T00:00:00.000Z",
    },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createUsersService(
    http as unknown as UsersHttpClient,
  ).createModerator({
    email: "staff@example.com",
    full_name: "Staff Member",
    role: "MODERATOR",
    username: "staff",
  });

  assert.deepEqual(calls, [
    {
      url: "/users",
      body: {
        email: "staff@example.com",
        full_name: "Staff Member",
        role: "MODERATOR",
        username: "staff",
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("staff Excel endpoints preserve filters and multipart upload", async () => {
  const calls: unknown[] = [];
  const exportBlob = new Blob(["export"]);
  const templateBlob = new Blob(["template"]);
  const importResult = {
    created: 1,
    updated: 0,
    errors: [],
    temporaryCredentials: [
      {
        email: "staff@example.com",
        fullName: "Staff Member",
        temporaryPassword: "Abcd2345!xyz",
        username: "staff",
      },
    ],
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return url.endsWith("import-template")
        ? { data: templateBlob }
        : { data: exportBlob };
    },
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: importResult } };
    },
  };
  const service = createUsersService(http as unknown as UsersHttpClient);
  const file = new File(["staff"], "staff.xlsx");

  assert.equal(await service.downloadStaffImportTemplate(), templateBlob);
  assert.equal(
    await service.exportStaff({ search: "lan", status: "ACTIVE" }),
    exportBlob,
  );
  assert.deepEqual(await service.importStaff(file), importResult);
  assert.deepEqual(calls.slice(0, 2), [
    {
      url: "/users/staff/import-template",
      config: { responseType: "blob" },
    },
    {
      url: "/users/staff/export",
      config: {
        params: { search: "lan", status: "ACTIVE" },
        responseType: "blob",
      },
    },
  ]);
  const importCall = calls[2] as { body: FormData; url: string };
  assert.equal(importCall.url, "/users/staff/import");
  assert.equal(importCall.body.get("file"), file);
});
