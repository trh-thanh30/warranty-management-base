import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { AuthUser } from "@repo/shared";
import { PERMISSION_GROUPS } from "@repo/shared/constants";
import {
  MAX_AVATAR_SIZE_BYTES,
  getProfileFormValues,
  groupPermissions,
  validateAvatarFile,
} from "./settings.utils.ts";

test("avatar validation accepts supported images up to five megabytes", () => {
  for (const type of ["image/jpeg", "image/png", "image/gif", "image/webp"]) {
    assert.equal(
      validateAvatarFile({ size: MAX_AVATAR_SIZE_BYTES, type }),
      null,
    );
  }
});

test("avatar validation rejects unsupported files", () => {
  assert.equal(
    validateAvatarFile({ size: 100, type: "image/svg+xml" }),
    "avatarTypeError",
  );
  assert.equal(
    validateAvatarFile({ size: 100, type: "application/pdf" }),
    "avatarTypeError",
  );
});

test("avatar validation rejects files larger than five megabytes", () => {
  assert.equal(
    validateAvatarFile({
      size: MAX_AVATAR_SIZE_BYTES + 1,
      type: "image/png",
    }),
    "avatarSizeError",
  );
});

test("profile form values map nullable API fields to editable strings", () => {
  const user = {
    id: "admin-1",
    email: "admin@example.com",
    username: "admin",
    full_name: null,
    phone: null,
    avatar_url: null,
    role: "admin",
    permissions: [],
    status: "ACTIVE",
    is_verified: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  } satisfies AuthUser;

  assert.deepEqual(getProfileFormValues(user), {
    fullName: "",
    phone: "",
    username: "admin",
    email: "admin@example.com",
  });
});

test("permission grouping retains permissions outside known groups", () => {
  const groups = groupPermissions(["DASHBOARD_VIEW", "CUSTOM_PERMISSION"]);

  assert.deepEqual(groups, [
    { key: "dashboard", permissions: ["DASHBOARD_VIEW"] },
    { key: "other", permissions: ["CUSTOM_PERMISSION"] },
  ]);
});

test("every permission group has a category label in each admin locale", () => {
  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      Settings?: { permissions?: { categories?: Record<string, string> } };
    };
    const categories = messages.Settings?.permissions?.categories ?? {};

    for (const group of PERMISSION_GROUPS) {
      assert.equal(
        typeof categories[group.key],
        "string",
        `${locale} is missing Settings.permissions.categories.${group.key}`,
      );
    }
  }
});
