import assert from "node:assert/strict";
import test from "node:test";
import { FileCheck2, ShieldCheck } from "lucide-react";
import {
  getNavigationBadge,
  getNavigationItemBadge,
  isNavigationItemActive,
} from "./app-sidebar.utils.ts";

test("hides empty and unavailable notification badges", () => {
  assert.equal(getNavigationBadge(0, false), null);
  assert.equal(getNavigationBadge(3, true), null);
});

test("formats visible notification badges", () => {
  assert.equal(getNavigationBadge(12, false), "12");
  assert.equal(getNavigationBadge(100, false), "99+");
});

const warrantyGroup = {
  title: "Warranties",
  icon: ShieldCheck,
  children: [
    {
      title: "Warranty list",
      href: "/warranties",
      icon: ShieldCheck,
    },
    {
      title: "Activation requests",
      href: "/warranty-activation-requests",
      icon: FileCheck2,
      notificationBadgeKey: "warranties" as const,
    },
  ],
};

test("marks a navigation group active for nested detail routes", () => {
  assert.equal(
    isNavigationItemActive(
      warrantyGroup,
      "/warranty-activation-requests/request-id",
    ),
    true,
  );
  assert.equal(isNavigationItemActive(warrantyGroup, "/products"), false);
});

test("surfaces a child notification badge on its parent group", () => {
  assert.equal(
    getNavigationItemBadge(
      warrantyGroup,
      { unread: 4, warranties: 4, warrantyClaims: 0 },
      false,
    ),
    "4",
  );
  assert.equal(
    getNavigationItemBadge(
      warrantyGroup,
      { unread: 4, warranties: 4, warrantyClaims: 0 },
      true,
    ),
    null,
  );
});
