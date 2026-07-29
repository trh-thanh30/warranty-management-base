import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

test("content pages use the shared HTTP client from a domain service folder", async () => {
  const servicePath = path.join(
    webRoot,
    "src",
    "services",
    "content-pages",
    "content-pages.service.ts",
  );
  const source = await readFile(servicePath, "utf8");

  assert.match(source, /publicHttpClient/);
  assert.match(source, /class ContentPagesService/);
  assert.match(source, /"\/public\/content-pages"/);
  assert.doesNotMatch(source, /\bfetch\(/);
  assert.doesNotMatch(source, /process\.env/);
});

test("content page callers use the domain service and the legacy root service is removed", async () => {
  const callerPaths = [
    "src/views/home/home.view.tsx",
    "src/views/policy/policy.view.tsx",
    "src/views/policy/policy-detail.view.tsx",
  ].map((relativePath) => path.join(webRoot, relativePath));
  const sources = await Promise.all(
    callerPaths.map((callerPath) => readFile(callerPath, "utf8")),
  );

  for (const source of sources) {
    assert.match(
      source,
      /@\/src\/services\/content-pages\/content-pages\.service/,
    );
    assert.doesNotMatch(source, /@\/src\/services\/content-pages\.service/);
  }

  await assert.rejects(
    access(path.join(webRoot, "src", "services", "content-pages.service.ts")),
  );
});

test("site settings use one cached website-config module through the shared HTTP client", async () => {
  const websiteConfigPath = path.join(
    webRoot,
    "src",
    "services",
    "website-config",
    "website-config.service.ts",
  );
  const publicHttpClientPath = path.join(
    webRoot,
    "src",
    "lib",
    "public-http-client.ts",
  );
  const [serviceSource, httpClientSource, layoutSource, homeSource] =
    await Promise.all([
      readFile(websiteConfigPath, "utf8"),
      readFile(publicHttpClientPath, "utf8"),
      readFile(path.join(webRoot, "app", "[locale]", "layout.tsx"), "utf8"),
      readFile(
        path.join(webRoot, "src", "views", "home", "home.view.tsx"),
        "utf8",
      ),
    ]);

  assert.match(serviceSource, /publicHttpClient/);
  assert.match(serviceSource, /from "react"/);
  assert.match(serviceSource, /cache\(/);
  assert.match(serviceSource, /getCachedSiteSetting/);
  assert.doesNotMatch(serviceSource, /\bfetch\(/);
  assert.match(
    httpClientSource,
    /process\.env\.PUBLIC_API_URL\s*\?\?\s*process\.env\.NEXT_PUBLIC_API_URL/,
  );
  assert.match(layoutSource, /getCachedSiteSetting\(locale\)/);
  assert.match(homeSource, /getCachedSiteSetting\(locale\)/);
  assert.doesNotMatch(layoutSource, /site-settings\.service/);
  assert.doesNotMatch(homeSource, /websiteConfigService\.getSiteSetting/);
  await assert.rejects(
    access(path.join(webRoot, "src", "services", "site-settings.service.ts")),
  );
});
