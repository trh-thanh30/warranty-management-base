import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthService,
  type AuthHttpClient,
} from "./create-auth.service.ts";

test("login uses the admin endpoint and returns the unwrapped auth payload", async () => {
  const calls: unknown[] = [];
  const payload = {
    access_token: "access-token",
    user: { id: "admin-1", role: "admin" },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: payload } };
    },
    async get() {
      throw new Error("Unexpected GET");
    },
  };

  const result = await createAuthService(
    http as unknown as AuthHttpClient,
  ).login({
    usernameOrEmail: "admin@example.com",
    password: "secret",
  });

  assert.deepEqual(calls, [
    {
      url: "/auth/login-admin",
      body: {
        usernameOrEmail: "admin@example.com",
        password: "secret",
      },
    },
  ]);
  assert.deepEqual(result, payload);
});
