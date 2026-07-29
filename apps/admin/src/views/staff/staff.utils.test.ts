import assert from "node:assert/strict";
import test from "node:test";
import {
  MODERATOR_MANAGEABLE_PERMISSIONS,
  PERMISSIONS,
} from "@repo/shared/constants";
import {
  buildModeratorPermissionOverrides,
  toggleModeratorPermission,
} from "./staff.utils.ts";

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

test("does not expose permissions that moderators cannot use", () => {
  assert.equal(
    MODERATOR_MANAGEABLE_PERMISSIONS.includes(PERMISSIONS.CUSTOMER_DELETE),
    false,
  );
  assert.equal(
    MODERATOR_MANAGEABLE_PERMISSIONS.includes(PERMISSIONS.WARRANTY_LOOKUP_OWN),
    false,
  );
  assert.equal(
    MODERATOR_MANAGEABLE_PERMISSIONS.includes(PERMISSIONS.SYSTEM_VIEW),
    false,
  );
  assert.equal(
    MODERATOR_MANAGEABLE_PERMISSIONS.includes(PERMISSIONS.AUDIT_LOG_VIEW),
    false,
  );
});

test("automatically grants view permission when enabling a dependent action", () => {
  const selected = toggleModeratorPermission(
    new Set(),
    PERMISSIONS.PRODUCT_DELETE,
    true,
  );

  assert.equal(selected.has(PERMISSIONS.PRODUCT_DELETE), true);
  assert.equal(selected.has(PERMISSIONS.PRODUCT_VIEW), true);
});

test("removes dependent actions when disabling view permission", () => {
  const selected = toggleModeratorPermission(
    new Set([
      PERMISSIONS.PRODUCT_VIEW,
      PERMISSIONS.PRODUCT_CREATE,
      PERMISSIONS.PRODUCT_UPDATE,
      PERMISSIONS.PRODUCT_DELETE,
      PERMISSIONS.DASHBOARD_VIEW,
    ]),
    PERMISSIONS.PRODUCT_VIEW,
    false,
  );

  assert.equal(selected.has(PERMISSIONS.PRODUCT_VIEW), false);
  assert.equal(selected.has(PERMISSIONS.PRODUCT_CREATE), false);
  assert.equal(selected.has(PERMISSIONS.PRODUCT_UPDATE), false);
  assert.equal(selected.has(PERMISSIONS.PRODUCT_DELETE), false);
  assert.equal(selected.has(PERMISSIONS.DASHBOARD_VIEW), true);
});
