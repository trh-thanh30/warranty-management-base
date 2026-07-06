import assert from "node:assert/strict";
import test from "node:test";
import { PERMISSIONS } from "@repo/shared/constants";
import { buildModeratorPermissionOverrides } from "./users.utils.ts";

test("persists only permission differences from moderator defaults", () => {
  const selected = new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_DELETE,
  ]);

  const overrides = buildModeratorPermissionOverrides(selected);

  assert.ok(
    overrides.some(
      (item) =>
        item.permissionKey === PERMISSIONS.PRODUCT_DELETE &&
        item.granted === true,
    ),
  );
  assert.ok(
    overrides.some(
      (item) =>
        item.permissionKey === PERMISSIONS.CUSTOMER_VIEW &&
        item.granted === false,
    ),
  );
  assert.equal(
    overrides.some((item) => item.permissionKey === PERMISSIONS.DASHBOARD_VIEW),
    false,
  );
  assert.equal(
    overrides.some((item) => item.permissionKey === PERMISSIONS.USER_VIEW),
    false,
  );
});
