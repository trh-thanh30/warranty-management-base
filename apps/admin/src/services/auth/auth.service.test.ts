import assert from "node:assert/strict";
import test from "node:test";
import { createAuthService } from "./create-auth.service.ts";
import type { AuthHttpClient } from "./auth.types.ts";

test("login starts the admin two-factor challenge", async () => {
  const calls: unknown[] = [];
  const payload = {
    requires_two_factor: true,
    challenge_id: "challenge-1",
    expires_at: "2026-08-01T10:10:00.000Z",
    available_methods: ["EMAIL_OTP", "PIN"],
    recommended_method: "EMAIL_OTP",
    pin_configured: false,
    masked_destination: "ad***@example.com",
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

test("two-factor verification and resend use their dedicated endpoints", async () => {
  const calls: unknown[] = [];
  const loginPayload = {
    access_token: "access-token",
    user: { id: "admin-1", role: "admin" },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return {
        data: {
          success: true,
          data: url.endsWith("resend-2fa")
            ? { expires_at: "2026-08-01T10:05:00.000Z" }
            : loginPayload,
        },
      };
    },
    async get() {
      throw new Error("Unexpected GET");
    },
  };
  const service = createAuthService(http as unknown as AuthHttpClient);

  await service.selectTwoFactorMethod({
    challengeId: "challenge-1",
    method: "PIN",
  });

  assert.deepEqual(
    await service.verifyTwoFactor({
      challengeId: "challenge-1",
      code: "123456",
    }),
    loginPayload,
  );
  await service.resendTwoFactor({ challengeId: "challenge-1" });
  await service.setupPin({
    challengeId: "challenge-1",
    pin: "123456",
    confirmPin: "123456",
  });
  await service.verifyPin({ challengeId: "challenge-1", pin: "123456" });

  assert.deepEqual(calls, [
    {
      url: "/auth/login-admin/select-method",
      body: { challengeId: "challenge-1", method: "PIN" },
    },
    {
      url: "/auth/login-admin/verify-2fa",
      body: { challengeId: "challenge-1", code: "123456" },
    },
    {
      url: "/auth/login-admin/resend-2fa",
      body: { challengeId: "challenge-1" },
    },
    {
      url: "/auth/login-admin/setup-pin",
      body: {
        challengeId: "challenge-1",
        pin: "123456",
        confirmPin: "123456",
      },
    },
    {
      url: "/auth/login-admin/verify-pin",
      body: { challengeId: "challenge-1", pin: "123456" },
    },
  ]);
});

test("profile updates use the authenticated profile endpoint", async () => {
  const calls: unknown[] = [];
  const updatedUser = { id: "admin-1", full_name: "Updated Admin" };
  const http = {
    async get() {
      throw new Error("Unexpected GET");
    },
    async post() {
      throw new Error("Unexpected POST");
    },
    async patch<T>(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: updatedUser as T } };
    },
  } satisfies AuthHttpClient;
  const body = {
    email: "updated@example.com",
    full_name: "Updated Admin",
  };

  const result = await createAuthService(http).updateProfile(body);

  assert.deepEqual(calls, [{ url: "/auth/me", body }]);
  assert.deepEqual(result, updatedUser);
});

test("avatar updates upload the file under the backend field name", async () => {
  const calls: Array<{ url: string; body?: unknown }> = [];
  const updatedUser = { id: "admin-1", avatar_url: "/avatar.png" };
  const http = {
    async get() {
      throw new Error("Unexpected GET");
    },
    async post() {
      throw new Error("Unexpected POST");
    },
    async patch<T>(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: updatedUser as T } };
    },
  } satisfies AuthHttpClient;
  const file = new File(["avatar"], "avatar.png", { type: "image/png" });

  const result = await createAuthService(http).updateAvatar(file);

  assert.equal(calls[0]?.url, "/auth/me/avatar");
  assert.ok(calls[0]?.body instanceof FormData);
  assert.equal((calls[0]?.body as FormData).get("file"), file);
  assert.deepEqual(result, updatedUser);
});

test("password changes send the current and replacement password", async () => {
  const calls: unknown[] = [];
  const http = {
    async get() {
      throw new Error("Unexpected GET");
    },
    async post() {
      throw new Error("Unexpected POST");
    },
    async patch<T>(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: undefined as T } };
    },
  } satisfies AuthHttpClient;
  const body = {
    currentPassword: "old-password",
    password: "new-password",
    confirmPassword: "new-password",
  };

  await createAuthService(http).changePassword(body);

  assert.deepEqual(calls, [{ url: "/auth/change-password", body }]);
});
