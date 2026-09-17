import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

test("footer uses a black-and-white hierarchy with red interaction accents", async () => {
  const [footer, socialLink, constants] = await Promise.all([
    readFile(
      path.join(webRoot, "src", "components", "layout", "site-footer.tsx"),
      "utf8",
    ),
    readFile(
      path.join(
        webRoot,
        "src",
        "components",
        "layout",
        "components",
        "footer-social-link.tsx",
      ),
      "utf8",
    ),
    readFile(
      path.join(
        webRoot,
        "src",
        "components",
        "layout",
        "site-footer.constants.ts",
      ),
      "utf8",
    ),
  ]);

  assert.match(footer, /bg-deep-black text-white/);
  assert.match(footer, /brightness-0 invert/);
  assert.match(footer, /text-white/);
  assert.match(footer, /text-nowrap text-xs font-medium uppercase text-white/);
  assert.match(footer, /hover:text-premium-red/);
  assert.match(footer, /border-white\/15/);
  assert.match(socialLink, /size-11/);
  assert.match(socialLink, /text-white/);
  assert.match(socialLink, /transition-colors/);
  assert.match(constants, /bg-facebook-blue/);
  assert.match(constants, /bg-zalo-blue/);
  assert.match(constants, /border-white\/40 bg-black/);
  assert.match(constants, /bg-danger-red/);
});

test("footer delays its four-column layout until wide screens", async () => {
  const footer = await readFile(
    path.join(webRoot, "src", "components", "layout", "site-footer.tsx"),
    "utf8",
  );

  assert.match(footer, /md:grid-cols-2 xl:grid-cols-\[4fr_3fr_3fr_3fr\]/);
  assert.match(footer, /min-w-0 space-y-4 pr-16 sm:pr-0/);
  assert.doesNotMatch(footer, /xl:col-span-/);
  assert.match(footer, /sm:text-sm xl:text-xs 2xl:text-sm/);
  assert.doesNotMatch(footer, /lg:grid-cols-12/);
  assert.doesNotMatch(footer, /break-all/);
});
