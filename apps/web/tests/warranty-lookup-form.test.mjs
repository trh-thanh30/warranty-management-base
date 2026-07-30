import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const validationMessages = {
  format: "format",
  maxLength: "maxLength",
  minLength: "minLength",
  required: "required",
};

async function loadSchemaModule() {
  try {
    return await import("../src/components/common/warranty-lookup-form.schema.ts");
  } catch {
    assert.fail("Warranty lookup form schema module must exist");
  }
}

test("warranty lookup schema trims a valid E-Warranty code", async () => {
  const { createWarrantyLookupFormSchema } = await loadSchemaModule();
  const schema = createWarrantyLookupFormSchema(validationMessages);

  assert.deepEqual(schema.parse({ warrantyCode: "  WM-2026-ABCDEF  " }), {
    warrantyCode: "WM-2026-ABCDEF",
  });
});

test("warranty lookup schema rejects invalid E-Warranty codes", async () => {
  const { createWarrantyLookupFormSchema } = await loadSchemaModule();
  const schema = createWarrantyLookupFormSchema(validationMessages);
  const invalidCases = [
    ["", "required"],
    ["ABC", "minLength"],
    ["A".repeat(65), "maxLength"],
    ["ABC_123", "format"],
  ];

  for (const [warrantyCode, expectedMessage] of invalidCases) {
    const result = schema.safeParse({ warrantyCode });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, expectedMessage);
    }
  }
});

test("page and modal use the shared warranty lookup form", async () => {
  const [pageSource, modalSource] = await Promise.all([
    readFile(
      new URL("../src/views/warranty/lookup.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/warranty-lookup-modal.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  for (const source of [pageSource, modalSource]) {
    assert.match(source, /WarrantyLookupForm/);
    assert.doesNotMatch(source, /<form\b/);
  }
});

test("shared warranty lookup form uses the form primitives with an accessible input", async () => {
  const source = await readFile(
    new URL(
      "../src/components/common/warranty-lookup-form.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /zodResolver/);
  assert.match(source, /useForm</);
  assert.match(source, /<FormField/);
  assert.match(source, /<FormControl>/);
  assert.match(source, /<FormMessage/);
  assert.match(source, /<Button/);
  assert.match(source, /aria-label=\{t\("ariaLabel"\)\}/);
});
