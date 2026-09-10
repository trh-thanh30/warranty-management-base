import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "../src/constants/website-homepage.constants.ts";
import {
  isHomepagePreviewMessage,
  isWebsiteEditableText,
  resolveWebsiteHomepageContent,
} from "../src/utils/website-homepage.ts";

test("wraps legacy landing strings with the field default style", () => {
  const resolved = resolveWebsiteHomepageContent({
    vi: { landing: { hero: { titlePrefix: "Tiêu đề cũ" } } },
  });

  assert.deepEqual(resolved.vi.landing.hero.titlePrefix, {
    align: "left",
    bold: true,
    color: "default",
    content: "Tiêu đề cũ",
    font: "heading",
    italic: false,
    size: "2xl",
  });
});

test("rejects arbitrary editable text style values", () => {
  assert.equal(
    isWebsiteEditableText({
      align: "left",
      bold: false,
      color: "#ff00ff",
      content: "Unsafe",
      font: "Comic Sans",
      italic: false,
      size: "72px",
    }),
    false,
  );
});

test("resolves partial homepage content without mutating the stored value", () => {
  const stored = {
    vi: {
      about: {
        title: "Tiêu đề mới",
      },
    },
  };

  const resolved = resolveWebsiteHomepageContent(stored);

  assert.equal(resolved.vi.about.title, "Tiêu đề mới");
  assert.equal(
    resolved.vi.products.title,
    DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.products.title,
  );
  assert.equal(
    resolved.en.about.title,
    DEFAULT_WEBSITE_HOMEPAGE_CONTENT.en.about.title,
  );
  assert.deepEqual(stored, {
    vi: { about: { title: "Tiêu đề mới" } },
  });
});

test("replaces fixed comparison arrays atomically", () => {
  const resolved = resolveWebsiteHomepageContent({
    vi: {
      comparison: {
        standardItems: ["Một mục"],
      },
    },
  });

  assert.deepEqual(resolved.vi.comparison.standardItems, ["Một mục"]);
});

test("accepts only valid homepage preview update messages", () => {
  const homepage = {
    aboutImage: null,
    copy: DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi,
    sputterChamberImage: null,
    sputterStructureImage: null,
  };

  assert.equal(
    isHomepagePreviewMessage({
      data: { heroSlides: [], homepage },
      locale: "vi",
      type: "warranty-homepage-preview:update",
      version: 1,
    }),
    true,
  );
  assert.equal(isHomepagePreviewMessage({ type: "unknown" }), false);
  assert.equal(
    isHomepagePreviewMessage({
      data: { heroSlides: [], homepage },
      locale: "fr",
      type: "warranty-homepage-preview:update",
      version: 1,
    }),
    false,
  );
});
