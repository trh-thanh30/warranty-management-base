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
