import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const routingPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "i18n",
  "routing.ts",
);
const middlewarePath = path.join(process.cwd(), "apps", "web", "middleware.ts");

test("locale preference persists in the next-intl cookie for one year", async () => {
  const source = await readFile(routingPath, "utf8");

  assert.match(source, /localeCookie:\s*\{/);
  assert.match(source, /LOCALE_COOKIE_NAME\s*=\s*"NEXT_LOCALE"/);
  assert.match(source, /name:\s*LOCALE_COOKIE_NAME/);
  assert.match(source, /maxAge:\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*365/);
  assert.match(source, /sameSite:\s*"lax"/);
});

test("first-time visitors default to Vietnamese instead of browser language", async () => {
  const [routingSource, middlewareSource] = await Promise.all([
    readFile(routingPath, "utf8"),
    readFile(middlewarePath, "utf8"),
  ]);

  assert.match(routingSource, /defaultLocale:\s*"vi"/);
  assert.doesNotMatch(
    routingSource,
    /localeDetection:\s*false/,
    "locale detection must stay enabled so an explicit cookie is respected",
  );
  assert.match(middlewareSource, /request\.cookies\.has\(LOCALE_COOKIE_NAME\)/);
  assert.match(
    middlewareSource,
    /headers\.set\("accept-language", routing\.defaultLocale\)/,
    "requests without a locale cookie must negotiate the Vietnamese default",
  );
});
