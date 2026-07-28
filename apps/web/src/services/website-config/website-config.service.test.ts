import assert from "node:assert/strict";
import test from "node:test";
import type { HttpClient } from "@repo/shared";
import { WebsiteConfigService } from "./website-config.service.ts";

test("loads the public site setting for the requested locale", async () => {
  const calls: Array<{ url: string; config?: unknown }> = [];
  const siteSetting = {
    locale: "vi" as const,
    heroSlides: [],
  };
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: unknown) {
      calls.push({ url, config });
      return {
        success: true,
        data: siteSetting,
      } as T;
    },
  };
  const service = new WebsiteConfigService(http);

  const result = await service.getSiteSetting("vi");

  assert.deepEqual(calls, [
    {
      url: "/public/site-settings",
      config: { params: { locale: "vi" } },
    },
  ]);
  assert.equal(result.locale, "vi");
});
