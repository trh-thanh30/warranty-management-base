import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

test("public routes keep a stable loading boundary during navigation", async () => {
  const [loadingSource, loadingViewSource] = await Promise.all([
    readFile(
      path.join(webRoot, "app", "[locale]", "loading.tsx"),
      "utf8",
    ).catch(() => ""),
    readFile(
      path.join(
        webRoot,
        "src",
        "components",
        "common",
        "public-page-loading.tsx",
      ),
      "utf8",
    ),
  ]);

  assert.match(loadingSource, /<PublicPageLoading\s*\/>/);
  assert.match(loadingViewSource, /aria-busy="true"/);
  assert.match(loadingViewSource, /min-h-/);
  assert.match(loadingViewSource, /motion-reduce:animate-none/);
});

test("unknown public routes show the not-found state instead of the generic page skeleton", async () => {
  const source = await readFile(
    path.join(
      webRoot,
      "src",
      "components",
      "common",
      "public-page-loading.tsx",
    ),
    "utf8",
  );

  assert.match(source, /usePathname\(\)/);
  assert.match(source, /isKnownPublicPathname\(pathname\)/);
  assert.match(source, /return <PublicNotFound\s*\/>/);
  assert.match(source, /routing\.pathnames/);
});

test("homepage streams remote sections through independent suspense boundaries", async () => {
  const source = await readFile(
    path.join(webRoot, "src", "views", "home", "home.view.tsx"),
    "utf8",
  );

  assert.match(source, /import \{ Suspense \} from "react"/);
  assert.match(source, /fallback=\{<HomeHeroSkeleton\s*\/>\}/);
  assert.match(source, /fallback=\{<HomeProductsSkeleton\s*\/>\}/);
  assert.match(source, /fallback=\{<HomeFaqSkeleton\s*\/>\}/);
});
