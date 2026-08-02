import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import {
  INDEXABLE_PATHNAMES,
  createLocalizedUrl,
  createPageAlternates,
  resolveSiteOrigin,
} from "../src/config/seo.config.ts";
import { createRobots } from "../app/robots.ts";
import { createSitemap } from "../app/sitemap.ts";

const siteOrigin = "https://baohanh.lexzenz.com";

test("SEO URLs use localized public pathnames", () => {
  assert.equal(
    createLocalizedUrl(siteOrigin, "/warranty", "vi"),
    "https://baohanh.lexzenz.com/vi/bao-hanh",
  );
  assert.equal(
    createLocalizedUrl(siteOrigin, "/warranty", "en"),
    "https://baohanh.lexzenz.com/en/warranty",
  );
});

test("page alternates expose canonical, Vietnamese, English and x-default URLs", () => {
  assert.deepEqual(createPageAlternates(siteOrigin, "/dealers", "vi"), {
    canonical: "https://baohanh.lexzenz.com/vi/he-thong-dai-ly",
    languages: {
      en: "https://baohanh.lexzenz.com/en/dealers",
      vi: "https://baohanh.lexzenz.com/vi/he-thong-dai-ly",
      "x-default": "https://baohanh.lexzenz.com/vi/he-thong-dai-ly",
    },
  });
});

test("site origin normalization removes paths and trailing slashes", () => {
  assert.equal(
    resolveSiteOrigin("https://baohanh.lexzenz.com/an-unwanted-path/"),
    siteOrigin,
  );
  assert.equal(resolveSiteOrigin(""), siteOrigin);
});

test("sitemap contains both locales for every indexable route only", () => {
  const sitemap = createSitemap(siteOrigin);

  assert.equal(sitemap.length, INDEXABLE_PATHNAMES.length * 2);
  assert.ok(
    sitemap.some(
      (entry) => entry.url === "https://baohanh.lexzenz.com/vi/bao-hanh",
    ),
  );
  assert.ok(
    sitemap.some(
      (entry) => entry.url === "https://baohanh.lexzenz.com/en/warranty",
    ),
  );

  for (const entry of sitemap) {
    assert.doesNotMatch(entry.url, /\/products(?:\/|$)/);
    assert.doesNotMatch(entry.url, /\/warranty\/activate(?:\/|$)/);
    assert.equal(Object.keys(entry.alternates?.languages ?? {}).length, 3);
  }
});

test("robots allows crawling and advertises the canonical sitemap", () => {
  assert.deepEqual(createRobots(siteOrigin), {
    host: siteOrigin,
    rules: { allow: "/", userAgent: "*" },
    sitemap: `${siteOrigin}/sitemap.xml`,
  });
});

test("the production Web image receives the canonical public site URL", async () => {
  const [dockerfile, workflow, compose, turbo] = await Promise.all([
    readFile(path.join(process.cwd(), "apps/web/Dockerfile"), "utf8"),
    readFile(
      path.join(process.cwd(), ".github/workflows/publish-images.yml"),
      "utf8",
    ),
    readFile(path.join(process.cwd(), "docker-compose.prod.yml"), "utf8"),
    readFile(path.join(process.cwd(), "turbo.json"), "utf8"),
  ]);

  assert.match(dockerfile, /ARG NEXT_PUBLIC_WEB_URL/);
  assert.match(dockerfile, /ENV NEXT_PUBLIC_WEB_URL=\$NEXT_PUBLIC_WEB_URL/);
  assert.match(
    workflow,
    /NEXT_PUBLIC_WEB_URL=\$\{\{ vars\.NEXT_PUBLIC_WEB_URL \}\}/,
  );
  assert.match(compose, /NEXT_PUBLIC_WEB_URL:/);
  assert.ok(JSON.parse(turbo).globalEnv.includes("NEXT_PUBLIC_WEB_URL"));
});
