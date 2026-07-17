import assert from "node:assert/strict";
import test from "node:test";
import { changePasswordSchema, profileSchema } from "./settings.types.ts";

test("profile validation trims submitted text values", () => {
  const result = profileSchema.parse({
    fullName: "  Admin User  ",
    phone: "  0901234567  ",
    username: "  admin  ",
    email: "  admin@example.com  ",
  });

  assert.deepEqual(result, {
    fullName: "Admin User",
    phone: "0901234567",
    username: "admin",
    email: "admin@example.com",
  });
});

test("password validation rejects a mismatched confirmation", () => {
  const result = changePasswordSchema.safeParse({
    currentPassword: "old-password",
    password: "new-password",
    confirmPassword: "different-password",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, "confirmPasswordMatch");
    assert.deepEqual(result.error.issues[0]?.path, ["confirmPassword"]);
  }
});
