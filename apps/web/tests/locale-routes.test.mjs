import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { legacyLocaleRedirects } from "../src/i18n/legacy-redirects.js";

const webRoot = path.join(process.cwd(), "apps", "web");
const localeRoot = path.join(webRoot, "app", "[locale]");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativeToLocale(file) {
  return path.relative(localeRoot, file).replaceAll(path.sep, "/");
}

const canonicalPages = [
  "about/page.tsx",
  "contact/page.tsx",
  "dealers/page.tsx",
  "guide/page.tsx",
  "policies/general/page.tsx",
  "policies/page.tsx",
  "policies/payment/page.tsx",
  "policies/privacy/page.tsx",
  "policies/purchasing/page.tsx",
  "policies/shipping/page.tsx",
  "policies/warranty-return/page.tsx",
  "products/[slug]/page.tsx",
  "products/page.tsx",
  "support-centers/page.tsx",
  "warranty/activate/page.tsx",
  "warranty/lookup/page.tsx",
  "warranty/page.tsx",
  "warranty/request/page.tsx",
  "warranty/track/page.tsx",
].sort();

const legacyFolderPattern =
  /^(?:bao-hanh|chinh-sach-|gioi-thieu|he-thong-dai-ly|lien-he|policy(?:\/|$)|san-pham)/;

test("locale app tree contains one canonical implementation per route", async () => {
  const pages = (await walk(localeRoot))
    .filter((file) => path.basename(file) === "page.tsx")
    .map(relativeToLocale)
    .filter((file) => file !== "page.tsx")
    .sort();

  const canonicalFound = pages.filter((file) => canonicalPages.includes(file));
  const legacyFound = pages.filter((file) => legacyFolderPattern.test(file));

  assert.deepEqual(canonicalFound, canonicalPages);
  assert.deepEqual(legacyFound, []);
});

test("localized pathname contract covers every canonical route", async () => {
  const routingSource = await readFile(
    path.join(webRoot, "src", "i18n", "routing.ts"),
    "utf8",
  );

  const expectedInternalPaths = [
    "/about",
    "/contact",
    "/dealers",
    "/guide",
    "/policies",
    "/policies/general",
    "/policies/payment",
    "/policies/privacy",
    "/policies/purchasing",
    "/policies/shipping",
    "/policies/warranty-return",
    "/products",
    "/products/[slug]",
    "/support-centers",
    "/warranty",
    "/warranty/activate",
    "/warranty/lookup",
    "/warranty/request",
    "/warranty/track",
  ];

  const missing = expectedInternalPaths.filter(
    (pathname) => !routingSource.includes(`"${pathname}"`),
  );

  assert.deepEqual(missing, []);
});

test("web source does not link to legacy implementation paths", async () => {
  const sourceFiles = (await walk(path.join(webRoot, "src")))
    .filter((file) => [".ts", ".tsx"].includes(path.extname(file)))
    .filter((file) => !file.endsWith("routing.ts"));
  const forbidden =
    /["'`](?:\/(?:gioi-thieu|san-pham|bao-hanh|lien-he|he-thong-dai-ly|chinh-sach-[^/"'`]+))/g;
  const violations = [];

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (forbidden.test(line)) {
        violations.push(
          `${path.relative(process.cwd(), file).replaceAll(path.sep, "/")}:${index + 1}`,
        );
      }
      forbidden.lastIndex = 0;
    });
  }

  assert.deepEqual(violations, []);
});

test("legacy locale URLs redirect to the matching localized public URL", () => {
  const redirects = new Map(
    legacyLocaleRedirects.map(({ source, destination, permanent }) => [
      source,
      { destination, permanent },
    ]),
  );

  assert.deepEqual(redirects.get("/vi/about"), {
    destination: "/vi/gioi-thieu",
    permanent: true,
  });
  assert.deepEqual(redirects.get("/vi/products/:slug"), {
    destination: "/vi/san-pham/:slug",
    permanent: true,
  });
  assert.deepEqual(redirects.get("/en/gioi-thieu"), {
    destination: "/en/about",
    permanent: true,
  });
  assert.deepEqual(redirects.get("/en/chinh-sach-bao-hanh-doi-tra"), {
    destination: "/en/policies/warranty-return",
    permanent: true,
  });
});
