import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

import { resolveGoogleAnalyticsMeasurementId } from "../src/config/analytics.config.ts";

const webRoot = path.join(process.cwd(), "apps/web");

test("Google Analytics measurement ID accepts GA4 IDs and disables invalid values", () => {
  assert.equal(
    resolveGoogleAnalyticsMeasurementId(" G-ABC123XYZ "),
    "G-ABC123XYZ",
  );
  assert.equal(resolveGoogleAnalyticsMeasurementId(""), null);
  assert.equal(resolveGoogleAnalyticsMeasurementId("UA-12345-1"), null);
});

test("locale layout mounts optional Google Analytics tracking", async () => {
  const [layout, component] = await Promise.all([
    readFile(path.join(webRoot, "app/[locale]/layout.tsx"), "utf8"),
    readFile(
      path.join(webRoot, "src/components/common/google-analytics.tsx"),
      "utf8",
    ),
  ]);

  assert.match(layout, /<GoogleAnalytics \/>/);
  assert.match(component, /googletagmanager\.com\/gtag\/js/);
  assert.match(component, /strategy="afterInteractive"/);
  assert.match(component, /resolveGoogleAnalyticsMeasurementId/);
});
