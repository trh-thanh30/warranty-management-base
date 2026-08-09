import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const readWebFile = (relativePath) =>
  readFile(path.join(webRoot, relativePath), "utf8");

test("about is the public homepage and the old about route redirects home", async () => {
  const [homePage, aboutPage, aboutRedirectView] = await Promise.all([
    readWebFile("app/[locale]/page.tsx"),
    readWebFile("app/[locale]/about/page.tsx"),
    readWebFile("src/views/about/about-redirect.view.tsx"),
  ]);

  assert.match(homePage, /import \{ AboutView \}/);
  assert.match(homePage, /generateAboutMetadata as generateMetadata/);
  assert.doesNotMatch(homePage, /HomeView/);
  assert.match(aboutPage, /import \{ AboutRedirectView \}/);
  assert.doesNotMatch(aboutPage, /<AboutView/);
  assert.match(
    aboutRedirectView,
    /redirect\(\{\s*href:\s*APP_ROUTES\.home,\s*locale/,
  );
});

test("product navigation opens the external catalog while internal routes stay disabled", async () => {
  const [
    featureConfig,
    header,
    headerNavLink,
    footer,
    footerItems,
    productsPage,
    productDetailPage,
  ] = await Promise.all([
    readWebFile("src/config/public-features.config.ts"),
    readWebFile("src/components/layout/site-header.tsx"),
    readWebFile("src/components/layout/components/header-nav-link.tsx"),
    readWebFile("src/components/layout/site-footer.tsx"),
    readWebFile("src/components/layout/site-footer.constants.ts"),
    readWebFile("app/[locale]/products/page.tsx"),
    readWebFile("app/[locale]/products/[slug]/page.tsx"),
  ]);

  assert.match(featureConfig, /products:\s*false/);
  assert.match(
    featureConfig,
    /PUBLIC_PRODUCT_CATALOG_URL\s*=\s*"https:\/\/lexzenz\.com\/san-pham\/"/,
  );
  assert.doesNotMatch(header, /labelKey:\s*"home"/);
  assert.match(header, /labelKey:\s*"about",\s*href:\s*APP_ROUTES\.home/);
  assert.match(header, /PUBLIC_PRODUCT_CATALOG_URL/);
  assert.match(header, /labelKey:\s*"products"/);
  assert.match(header, /external:\s*true/);
  assert.match(footerItems, /id:\s*"about",\s*href:\s*APP_ROUTES\.home/);
  assert.match(footerItems, /PUBLIC_PRODUCT_CATALOG_URL/);
  assert.match(footerItems, /id:\s*"products"/);
  assert.match(headerNavLink, /target="_blank"/);
  assert.match(headerNavLink, /rel="noopener noreferrer"/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);

  for (const source of [productsPage, productDetailPage]) {
    assert.match(source, /if \(!PUBLIC_FEATURES\.products\)/);
    assert.match(source, /notFound\(\)/);
  }
});

test("disabled contact navigation stays hidden without disabling contact flows", async () => {
  const [featureConfig, header, footerItems, contactPage] = await Promise.all([
    readWebFile("src/config/public-features.config.ts"),
    readWebFile("src/components/layout/site-header.tsx"),
    readWebFile("src/components/layout/site-footer.constants.ts"),
    readWebFile("app/[locale]/contact/page.tsx"),
  ]);

  assert.match(featureConfig, /contactNavigation:\s*false/);
  assert.match(header, /PUBLIC_FEATURES\.contactNavigation/);
  assert.match(footerItems, /PUBLIC_FEATURES\.contactNavigation/);
  assert.doesNotMatch(contactPage, /notFound\(\)/);
});

test("public warranty activation is enabled while its feature guards remain available", async () => {
  const [featureConfig, activationPage, actions, lookup, floatingAction] =
    await Promise.all([
      readWebFile("src/config/public-features.config.ts"),
      readWebFile("app/[locale]/warranty/activate/page.tsx"),
      readWebFile("src/views/warranty/warranty.constants.ts"),
      readWebFile("src/views/warranty/lookup.view.tsx"),
      readWebFile("src/components/floating-quick-action.tsx"),
    ]);

  assert.match(featureConfig, /warrantyActivation:\s*true/);
  assert.match(activationPage, /if \(!PUBLIC_FEATURES\.warrantyActivation\)/);
  assert.match(activationPage, /WarrantyActivateView/);

  for (const source of [actions, lookup, floatingAction]) {
    assert.match(source, /PUBLIC_FEATURES\.warrantyActivation/);
  }
});

test("public contact calls to action open quick chat instead of navigating", async () => {
  const [hero, ecosystem, dealerRecruitment, productsView] = await Promise.all([
    readWebFile("src/views/about/components/about-hero-corporate.tsx"),
    readWebFile("src/views/about/components/about-product-ecosystem.tsx"),
    readWebFile("src/views/dealers/components/dealer-recruitment-cta.tsx"),
    readWebFile("src/views/products/products.view.tsx"),
  ]);

  for (const source of [hero, ecosystem, dealerRecruitment, productsView]) {
    assert.match(source, /openPublicQuickChat/);
    assert.doesNotMatch(source, /APP_ROUTES\.contact/);
  }

  assert.match(hero, /PUBLIC_FEATURES\.products/);
  assert.match(ecosystem, /PUBLIC_FEATURES\.products/);
});
