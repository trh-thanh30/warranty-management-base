import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dealerNetworkUrl = "https://lexzenz.com/he-thong-dai-ly/";

const navigationSources = [
  "../src/components/layout/site-header.tsx",
  "../src/components/layout/site-footer.constants.ts",
  "../src/views/about/components/about-hero-corporate.tsx",
  "../src/views/about/components/about-network-banner.tsx",
  "../src/views/about/components/about-b2b-cta.tsx",
  "../src/views/product-detail/product-detail.view.tsx",
  "../src/views/warranty/activate.view.tsx",
  "../src/views/warranty/lookup.view.tsx",
  "../src/views/warranty/request.view.tsx",
  "../src/views/warranty/track.view.tsx",
  "../src/views/warranty/warranty.constants.ts",
];

test("dealer network navigation points to the external Lexzenz page", async () => {
  const sources = await Promise.all(
    navigationSources.map((relativePath) =>
      readFile(new URL(relativePath, import.meta.url), "utf8"),
    ),
  );

  for (const source of sources) {
    assert.match(source, /PUBLIC_DEALER_NETWORK_URL/);
    assert.doesNotMatch(source, /APP_ROUTES\.dealers/);
  }

  const configSource = await readFile(
    new URL("../src/config/public-features.config.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    configSource,
    new RegExp(dealerNetworkUrl.replaceAll("/", "\\/")),
  );

  const actionCardsSource = await readFile(
    new URL(
      "../src/views/warranty/components/warranty-action-cards.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(actionCardsSource, /isExternal/);
  assert.match(actionCardsSource, /target="_blank"/);

  const sharedLinkSources = await Promise.all(
    [
      "../src/components/layout/components/header-nav-link.tsx",
      "../src/components/layout/site-footer.tsx",
    ].map((relativePath) =>
      readFile(new URL(relativePath, import.meta.url), "utf8"),
    ),
  );
  for (const source of sharedLinkSources) {
    assert.match(source, /target="_blank"/);
  }
});
