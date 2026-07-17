import assert from "node:assert/strict";
import test from "node:test";
import { contentPageFormSchema } from "./content-pages.types.ts";

test("content page form accepts backend kinds and trims text", () => {
  const result = contentPageFormSchema.parse({
    slug: "  warranty-policy  ",
    title: "  Warranty policy  ",
    summary: "  Summary  ",
    content: "<p>Policy</p>",
    kind: "POLICY",
    status: "DRAFT",
  });

  assert.equal(result.slug, "warranty-policy");
  assert.equal(result.title, "Warranty policy");
  assert.equal(result.kind, "POLICY");
});

test("content page form rejects invalid slugs and empty rich text", () => {
  const invalidSlug = contentPageFormSchema.safeParse({
    slug: "Warranty Policy",
    title: "Warranty policy",
    summary: "",
    content: "<p>Policy</p>",
    kind: "POLICY",
    status: "DRAFT",
  });
  const emptyContent = contentPageFormSchema.safeParse({
    slug: "warranty-policy",
    title: "Warranty policy",
    summary: "",
    content: "<p></p>",
    kind: "POLICY",
    status: "DRAFT",
  });

  assert.equal(invalidSlug.success, false);
  assert.equal(emptyContent.success, false);
});
