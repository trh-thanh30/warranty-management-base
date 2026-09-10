import assert from "node:assert/strict";
import test from "node:test";
import {
  createHomepagePuckConfig,
  getHomepageEditorPermissions,
  homepageEditorPermissions,
  type HomepageEditorLabels,
} from "./homepage-puck.config";

const labels: HomepageEditorLabels = {
  align: "Căn lề",
  bold: "In đậm",
  color: "Màu",
  font: "Phông chữ",
  italic: "In nghiêng",
  sectionFields: {},
  sections: {
    b2b: "Hợp tác đại lý",
    brandHeritage: "Câu chuyện thương hiệu",
    coreTech: "Công nghệ cốt lõi",
    hero: "Hero",
    milestones: "Cột mốc",
    network: "Mạng lưới đại lý",
    pillars: "Giá trị cốt lõi",
    testimonials: "Đánh giá",
  },
  size: "Kích thước",
};

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
  const config = createHomepagePuckConfig({
    heroImageUrl: "/hero.jpg",
    labels,
  });
  const heroFields = config.components.HomepageHero.fields;

  assert.equal(heroFields?.eyebrowContent?.type, "text");
  assert.equal(
    "contentEditable" in (heroFields?.eyebrowContent ?? {}) &&
      heroFields?.eyebrowContent.contentEditable,
    true,
  );
  assert.equal(heroFields?.eyebrowStyle?.type, "custom");
});

test("homepage editor labels are supplied by the active locale", () => {
  const config = createHomepagePuckConfig({
    heroImageUrl: "/hero.jpg",
    labels,
  });

  assert.equal(config.components.HomepageCoreTech.label, "Công nghệ cốt lõi");
});
