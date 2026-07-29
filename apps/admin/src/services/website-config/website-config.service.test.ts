import assert from "node:assert/strict";
import test from "node:test";
import { createWebsiteConfigService } from "./create-website-config.service.ts";
import type { WebsiteConfigHttpClient } from "./website-config.types.ts";

test("uses the protected site draft and publish endpoints", async () => {
  const calls: unknown[] = [];
  const result = { revision: { draftVersion: 2 } };
  const http = {
    async patch(url: string, body: unknown) {
      calls.push({ body, method: "patch", url });
      return { data: { data: result, success: true } };
    },
    async post(url: string, body: unknown) {
      calls.push({ body, method: "post", url });
      return { data: { data: result, success: true } };
    },
  };
  const service = createWebsiteConfigService(
    http as unknown as WebsiteConfigHttpClient,
  );
  const body = {
    contactEmail: "hello@example.com",
    expectedVersion: 1,
    footerLogoAssetId: null,
    headerLogoAssetId: null,
    heroSlides: [],
    offices: [],
    socialLinks: [],
    ogImageAssetId: null,
    websiteUrl: "https://example.com",
  };

  await service.saveSite(body);
  await service.publishSite({ expectedVersion: 2 });

  assert.deepEqual(calls, [
    {
      body,
      method: "patch",
      url: "/website-config/site-settings/draft",
    },
    {
      body: { expectedVersion: 2 },
      method: "post",
      url: "/website-config/site-settings/publish",
    },
  ]);
});
