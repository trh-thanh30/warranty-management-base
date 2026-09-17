import assert from "node:assert/strict";
import test from "node:test";
import { createSystemConfigService } from "./create-system-config.service.ts";
import type { SystemConfigHttpClient } from "./system-config.types.ts";

test("loads and updates activation code policy", async () => {
  const calls: unknown[] = [];
  const policy = {
    expiryMonths: 6,
    defaultBatchQuantity: 50,
    minBatchQuantity: 50,
    maxBatchQuantity: 1000,
  };
  const http = {
    async get(url: string) {
      calls.push({ method: "get", url });
      return { data: { success: true, data: policy } };
    },
    async post(url: string, body: unknown) {
      calls.push({ method: "post", url, body });
      return { data: { success: true, data: policy } };
    },
  };
  const service = createSystemConfigService(
    http as unknown as SystemConfigHttpClient,
  );

  assert.equal(await service.getActivationCodePolicy(), policy);
  assert.equal(await service.updateActivationCodePolicy(policy), policy);
  assert.deepEqual(calls, [
    { method: "get", url: "/system-config/activation-code-policy" },
    {
      method: "post",
      url: "/system-config/activation-code-policy",
      body: policy,
    },
  ]);
});

test("loads and updates the contact notification recipient", async () => {
  const calls: unknown[] = [];
  const settings = { email: "admin@lexzenz.vn" };
  const http = {
    async get(url: string) {
      calls.push({ method: "get", url });
      return { data: { success: true, data: settings } };
    },
    async post(url: string, body: unknown) {
      calls.push({ method: "post", url, body });
      return { data: { success: true, data: settings } };
    },
  };
  const service = createSystemConfigService(http as SystemConfigHttpClient);

  assert.deepEqual(await service.getContactNotificationSettings(), settings);
  assert.deepEqual(
    await service.updateContactNotificationSettings(settings),
    settings,
  );
  assert.deepEqual(calls, [
    { method: "get", url: "/system-config/contact-notification-settings" },
    {
      method: "post",
      url: "/system-config/contact-notification-settings",
      body: settings,
    },
  ]);
});
