import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

test("header and footer use the published Admin site configuration", async () => {
  const [layout, header, footer, constants, service, socialLink, siteLogo] =
    await Promise.all([
      readFile(
        path.join(process.cwd(), "apps/web/app/[locale]/layout.tsx"),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/components/layout/site-header.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/components/layout/site-footer.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/components/layout/site-footer.constants.ts",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/services/site-settings.service.ts",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/components/layout/components/footer-social-link.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "apps/web/src/components/layout/components/site-logo.tsx",
        ),
        "utf8",
      ),
    ]);

  assert.match(service, /\/public\/site-settings\?locale=/);
  assert.match(layout, /getPublicSiteSettings\(locale\)/);
  assert.match(
    layout,
    /<SiteHeader logoUrl=\{siteSettings\?\.headerLogo\?\.url\}/,
  );
  assert.match(layout, /<SiteFooter siteSettings=\{siteSettings\} \/>/);
  assert.match(header, /<SiteLogo/);
  assert.match(header, /src=\{logoUrl\}/);
  assert.match(footer, /src=\{siteSettings\?\.footerLogo\?\.url\}/);
  assert.match(footer, /siteSettings\?\.offices/);
  assert.match(footer, /siteSettings\?\.contactEmail/);
  assert.match(footer, /siteSettings\?\.websiteUrl/);
  assert.match(footer, /footerSocialItems\.map\(\(item\)/);
  assert.match(footer, /socialLinks\.find\(/);
  assert.match(footer, /social\.platform === item\.platform/);
  assert.match(footer, /href=\{configuredLink\?\.url\}/);
  assert.match(footer, /social\.url\.startsWith\("https:\/\/"\)/);
  assert.doesNotMatch(constants, /href:\s*"#"/);
  for (const platform of ["FACEBOOK", "ZALO", "TIKTOK", "YOUTUBE"]) {
    assert.ok(constants.includes(`platform: "${platform}"`));
  }
  assert.match(socialLink, /target="_blank"/);
  assert.match(socialLink, /rel="noopener noreferrer"/);
  assert.match(socialLink, /if \(!href\)/);
  assert.match(siteLogo, /DEFAULT_SITE_LOGO_SRC/);
  assert.match(siteLogo, /const configuredSrc = src\?\.trim\(\)/);
  assert.doesNotMatch(constants, /0886 33 77 33/);
  assert.doesNotMatch(constants, /fujitek\.lexzenz\.vn@gmail\.com/);
});
