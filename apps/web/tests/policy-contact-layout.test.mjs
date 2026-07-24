import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

test("policy contact hotlines follow their matching office address", async () => {
  const source = await readFile(
    path.join(
      process.cwd(),
      "apps",
      "web",
      "src",
      "views",
      "policy",
      "policy-detail.view.tsx",
    ),
    "utf8",
  );

  const contactBlock = source.slice(
    source.indexOf("Company Contact Info Footer Block"),
  );
  const hcmAddress = contactBlock.indexOf("7C Nguyễn Ngọc Phương");
  const hcmHotline = contactBlock.indexOf('href="tel:0886337733"');
  const hanoiAddress = contactBlock.indexOf("Số 62, Ngõ 20 Nghĩa Đô");
  const hanoiHotline = contactBlock.indexOf('href="tel:0989017999"');

  assert.ok(
    hcmAddress < hcmHotline &&
      hcmHotline < hanoiAddress &&
      hanoiAddress < hanoiHotline,
    "each office address should be immediately followed by its own hotline",
  );
});
