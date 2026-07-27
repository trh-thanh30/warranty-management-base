import assert from "node:assert/strict";
import test from "node:test";
import { CONTENT_PAGE_KINDS } from "./content-pages.constants.ts";
import { contentPageFormSchema } from "./content-pages.types.ts";

test("content page kinds contain the six policies and FAQ only", () => {
  assert.deepEqual(CONTENT_PAGE_KINDS, [
    "GENERAL_POLICY",
    "PRIVACY_POLICY",
    "PURCHASE_POLICY",
    "WARRANTY_RETURN_POLICY",
    "SHIPPING_POLICY",
    "PAYMENT_POLICY",
    "FAQ",
  ]);
});

test("content page form accepts backend kinds and trims text", () => {
  const result = contentPageFormSchema.parse({
    slug: "  warranty-policy  ",
    title: "  Warranty policy  ",
    summary: "  Summary  ",
    content: "<p>Policy</p>",
    categoryId: "",
    kind: "GENERAL_POLICY",
  });

  assert.equal(result.slug, "warranty-policy");
  assert.equal(result.title, "Warranty policy");
  assert.equal(result.kind, "GENERAL_POLICY");
});

test("content page form rejects removed guide and introduction kinds", () => {
  for (const kind of ["GUIDE", "INTRO"]) {
    const result = contentPageFormSchema.safeParse({
      slug: "warranty-policy",
      title: "Warranty policy",
      summary: "",
      content: "<p>Policy</p>",
      categoryId: "",
      kind,
    });

    assert.equal(result.success, false);
  }
});

test("content page form rejects invalid slugs and empty rich text", () => {
  const invalidSlug = contentPageFormSchema.safeParse({
    slug: "Warranty Policy",
    title: "Warranty policy",
    summary: "",
    content: "<p>Policy</p>",
    categoryId: "",
    kind: "GENERAL_POLICY",
  });
  const emptyContent = contentPageFormSchema.safeParse({
    slug: "warranty-policy",
    title: "Warranty policy",
    summary: "",
    content: "<p></p>",
    categoryId: "",
    kind: "GENERAL_POLICY",
  });

  assert.equal(invalidSlug.success, false);
  assert.equal(emptyContent.success, false);
});
