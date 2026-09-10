import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import {
  fromHomepagePuckData,
  HomepageEditorDataError,
  homepagePuckSectionIds,
  toHomepagePuckData,
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
