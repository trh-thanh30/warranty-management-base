import assert from "node:assert/strict";
import test from "node:test";
import { createFieldErrorFormatter, translateFieldError } from "./form.ts";

test("translateFieldError translates known keys and preserves API messages", () => {
  const translate = (key: string) => `translated:${key}`;

  assert.equal(
    translateFieldError("required", translate, new Set(["required"])),
    "translated:required",
  );
  assert.equal(
    translateFieldError("Server validation failed", translate, ["required"]),
    "Server validation failed",
  );
  assert.equal(
    translateFieldError(undefined, translate, ["required"]),
    undefined,
  );
});

test("createFieldErrorFormatter reuses one feature translation key set", () => {
  const formatError = createFieldErrorFormatter(["emailInvalid"]);

  assert.equal(
    formatError("emailInvalid", (key) => `translated:${key}`),
    "translated:emailInvalid",
  );
});
