import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const footerPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "components",
  "layout",
  "site-footer.tsx",
);

test("footer marks navigation and policy links for the current page", async () => {
  const source = await readFile(footerPath, "utf8");

  assert.match(source, /const pathname = usePathname\(\)/);
  assert.equal(
    [...source.matchAll(/isNavigationItemActive\(pathname, item\.href\)/g)]
      .length,
    2,
  );
  assert.equal(
    [...source.matchAll(/aria-current=\{isActive \? "page" : undefined\}/g)]
      .length,
    2,
  );
  assert.match(source, /font-semibold text-premium-red/);
});
