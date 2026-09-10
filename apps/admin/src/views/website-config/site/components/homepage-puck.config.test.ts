import assert from "node:assert/strict";
import test from "node:test";
import {
  createHomepagePuckConfig,
  getHomepageEditorPermissions,
  homepageEditorPermissions,
} from "./homepage-puck.config";

test("homepage editor disables structural Puck actions", () => {
  assert.deepEqual(homepageEditorPermissions, {
    delete: false,
    drag: false,
    duplicate: false,
    insert: false,
    edit: true,
  });
  assert.deepEqual(getHomepageEditorPermissions(true), {
    ...homepageEditorPermissions,
    edit: false,
  });
});

test("homepage text fields support direct canvas editing", () => {
  const config = createHomepagePuckConfig({ heroImageUrl: "/hero.jpg" });
  const heroFields = config.components.HomepageHero.fields;

  assert.equal(heroFields?.eyebrowContent?.type, "text");
  assert.equal(
    "contentEditable" in (heroFields?.eyebrowContent ?? {}) &&
      heroFields?.eyebrowContent.contentEditable,
    true,
  );
  assert.equal(heroFields?.eyebrowStyle?.type, "custom");
});
