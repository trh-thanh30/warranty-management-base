import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

test("public policy detail loads published admin content", async () => {
  const source = await readFile(
    path.join(webRoot, "src", "views", "policy", "policy-detail.view.tsx"),
    "utf8",
  );

  assert.match(source, /getPublishedContentPage/);
  assert.match(source, /config\.slugs\[policyLocale\]/);
  assert.match(source, /<PolicyDocument/);
  assert.match(source, /emptyTitle=\{t\("emptyTitle"\)\}/);
});

test("policy routes map both locales to admin content slugs", async () => {
  const source = await readFile(
    path.join(webRoot, "src", "views", "policy", "policy.constants.ts"),
    "utf8",
  );

  const vietnameseSlugs = [
    "chinh-sach-quy-dinh-chung",
    "chinh-sach-bao-mat",
    "chinh-sach-mua-hang",
    "chinh-sach-bao-hanh-doi-tra",
    "chinh-sach-giao-hang",
    "chinh-sach-thanh-toan",
  ];
  const englishSlugs = [
    "policies-general",
    "policies-privacy",
    "policies-purchasing",
    "policies-warranty-return",
    "policies-shipping",
    "policies-payment",
  ];

  for (const slug of [...vietnameseSlugs, ...englishSlugs]) {
    assert.ok(source.includes(`"${slug}"`), `missing policy slug ${slug}`);
  }
});

test("admin preview and public web share the policy document component", async () => {
  const previewSource = await readFile(
    path.join(
      process.cwd(),
      "apps",
      "admin",
      "src",
      "views",
      "content-pages",
      "components",
      "content-page-preview-dialog.tsx",
    ),
    "utf8",
  );

  assert.match(previewSource, /PolicyDocument/);
  assert.doesNotMatch(previewSource, /<iframe/);
});
