import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import {
  fromHomepagePuckData,
  HomepageEditorDataError,
  type HomepageLandingCopy,
  homepagePuckSectionIds,
  toHomepagePuckData,
  unflattenSection,
} from "./homepage-puck.adapters";

test("domain to Puck to domain preserves fixed homepage content", () => {
  const initial = DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing;

  assert.deepEqual(fromHomepagePuckData(toHomepagePuckData(initial)), initial);
});

test("Puck data always contains the eight canonical ids", () => {
  const data = toHomepagePuckData(DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing);

  assert.deepEqual(
    data.content.map((item) => item.props.id),
    homepagePuckSectionIds,
  );
});

test("adapter rejects missing or duplicated canonical sections", () => {
  const initial = toHomepagePuckData(
    DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing,
  );
  const missing = { ...initial, content: initial.content.slice(1) };
  const duplicated = {
    ...initial,
    content: [...initial.content, initial.content[0]!],
  };

  assert.throws(() => fromHomepagePuckData(missing), HomepageEditorDataError);
  assert.throws(
    () => fromHomepagePuckData(duplicated),
    HomepageEditorDataError,
  );
});

test("adapter accepts Puck inline field nodes while rendering", () => {
  const data = toHomepagePuckData(DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing);
  const hero = data.content[0]!;
  const props = hero.props as unknown as Record<string, unknown>;
  props.eyebrowContent = createElement("span", null, "Inline text");

  const restored = unflattenSection(hero.props, "hero", {
    allowRenderableContent: true,
  });

  const heroCopy = restored as HomepageLandingCopy["hero"];
  assert.equal(
    (heroCopy.eyebrow.content as unknown as { type: string }).type,
    "span",
  );
});
