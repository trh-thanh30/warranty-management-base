import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

test("footer social buttons use maintained brand icon components", async () => {
  const source = await readFile(
    path.join(
      process.cwd(),
      "apps",
      "web",
      "src",
      "components",
      "layout",
      "site-footer.constants.ts",
    ),
    "utf8",
  );

  for (const icon of ["FaFacebookF", "FaTiktok", "FaYoutube", "SiZalo"]) {
    assert.match(source, new RegExp(`icon:\\s*${icon}\\b`));
  }

  assert.doesNotMatch(
    source,
    /function (?:Facebook|Zalo|TikTok|YouTube)Icon\(/,
  );
});

test("footer identifies FUJITEK Japan with an accessible decorative flag", async () => {
  const [source, viMessages, enMessages] = await Promise.all([
    readFile(
      path.join(
        process.cwd(),
        "apps",
        "web",
        "src",
        "components",
        "layout",
        "site-footer.tsx",
      ),
      "utf8",
    ),
    readFile(
      path.join(process.cwd(), "apps", "web", "src", "messages", "vi.json"),
      "utf8",
    ).then(JSON.parse),
    readFile(
      path.join(process.cwd(), "apps", "web", "src", "messages", "en.json"),
      "utf8",
    ).then(JSON.parse),
  ]);

  assert.match(source, /\{t\("japan"\)\}/);
  assert.doesNotMatch(source, /\{t\("korea"\)\}/);
  assert.match(
    source,
    /data-footer-japan-flag[\s\S]*?aria-hidden="true"[\s\S]*?bg-premium-red/,
  );

  for (const messages of [viMessages, enMessages]) {
    assert.equal(messages.HomePage.footer.japan, "FUJITEK JAPAN");
    assert.equal(messages.HomePage.footer.korea, undefined);
  }
});
