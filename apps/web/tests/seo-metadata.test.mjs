import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import {
  INDEXABLE_PATHNAMES,
  SEO_PAGE_KEYS,
  createLocalizedUrl,
  createPageAlternates,
  createPageSeoMetadata,
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

test("warranty page metadata has its own title, description and social URLs", () => {
  const metadata = createPageSeoMetadata({
    siteOrigin,
    pathname: "/warranty/lookup",
    locale: "vi",
    title: "Tra cứu bảo hành điện tử | Fujitek & Lexzenz",
    description: "Tra cứu thời hạn bảo hành bằng mã bảo hành.",
    siteName: "Bảo hành điện tử Fujitek & Lexzenz",
  });

  assert.equal(metadata.title, "Tra cứu bảo hành điện tử | Fujitek & Lexzenz");
  assert.equal(
    metadata.description,
    "Tra cứu thời hạn bảo hành bằng mã bảo hành.",
  );
  assert.equal(
    metadata.alternates?.canonical,
    "https://baohanh.lexzenz.com/vi/bao-hanh/tra-cuu",
  );
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.equal(metadata.openGraph?.locale, "vi_VN");
  assert.equal(metadata.twitter?.card, "summary");
});

test("each indexable page has distinct Vietnamese and English SEO copy", async () => {
  const [vi, en] = await Promise.all(
    ["vi", "en"].map(async (locale) =>
      JSON.parse(
        await readFile(
          path.join(process.cwd(), "apps/web/src/messages", `${locale}.json`),
          "utf8",
        ),
      ),
    ),
  );

  assert.equal(Object.keys(SEO_PAGE_KEYS).length, INDEXABLE_PATHNAMES.length);
  for (const messages of [vi, en]) {
    const titles = INDEXABLE_PATHNAMES.map((pathname) => {
      const copy = messages.Seo[SEO_PAGE_KEYS[pathname]];
      assert.ok(copy?.title, `Missing title for ${pathname}`);
      assert.ok(copy?.description, `Missing description for ${pathname}`);
      return copy.title;
    });
    assert.equal(new Set(titles).size, titles.length);
  }
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
  assert.ok(
    sitemap.some(
      (entry) =>
        entry.url === "https://baohanh.lexzenz.com/vi/bao-hanh/kich-hoat",
    ),
  );

  for (const entry of sitemap) {
    assert.doesNotMatch(entry.url, /\/(?:vi|en)\/?$/);
    assert.doesNotMatch(entry.url, /\/products(?:\/|$)/);
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
  const [dockerfile, publishWorkflow, deployWorkflow, compose, turbo] =
    await Promise.all([
      readFile(path.join(process.cwd(), "apps/web/Dockerfile"), "utf8"),
      readFile(
        path.join(process.cwd(), ".github/workflows/publish-images.yml"),
        "utf8",
      ),
      readFile(
        path.join(process.cwd(), ".github/workflows/deploy.yml"),
        "utf8",
      ),
      readFile(path.join(process.cwd(), "docker-compose.prod.yml"), "utf8"),
      readFile(path.join(process.cwd(), "turbo.json"), "utf8"),
    ]);

  assert.match(dockerfile, /ARG NEXT_PUBLIC_WEB_URL/);
  assert.doesNotMatch(
    dockerfile,
    /ARG NEXT_PUBLIC_WEB_URL=/,
    "the public URL must come from the build environment",
  );
  assert.match(dockerfile, /NEXT_PUBLIC_WEB_URL build argument is required/);
  assert.match(dockerfile, /ENV NEXT_PUBLIC_WEB_URL=\$NEXT_PUBLIC_WEB_URL/);
  assert.match(
    publishWorkflow,
    /NEXT_PUBLIC_WEB_URL=\$\{\{ vars\.NEXT_PUBLIC_WEB_URL \}\}/,
  );
  assert.match(
    deployWorkflow,
    /NEXT_PUBLIC_WEB_URL: \$\{\{ vars\.NEXT_PUBLIC_WEB_URL \}\}/,
  );
  assert.match(
    deployWorkflow,
    /NEXT_PUBLIC_WEB_URL GitHub Actions variable is required/,
  );
  assert.match(
    compose,
    /NEXT_PUBLIC_WEB_URL: \$\{NEXT_PUBLIC_WEB_URL:\?NEXT_PUBLIC_WEB_URL is required\}/,
  );
  assert.ok(JSON.parse(turbo).globalEnv.includes("NEXT_PUBLIC_WEB_URL"));
});
