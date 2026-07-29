import assert from "node:assert/strict";
import test from "node:test";
import { FileCheck2, ShieldCheck } from "lucide-react";
import {
  getActiveNavigationHref,
  getNavigationBadge,
  getNavigationItemBadge,
  hasActiveNavigationDescendant,
  isNavigationItemActive,
} from "./app-sidebar.utils.ts";

const icon = () => null;

test("hides empty and unavailable notification badges", () => {
  assert.equal(getNavigationBadge(0, false), null);
  assert.equal(getNavigationBadge(3, true), null);
});

test("formats visible notification badges", () => {
  assert.equal(getNavigationBadge(12, false), "12");
  assert.equal(getNavigationBadge(100, false), "99+");
});

test("selects only the longest matching nested route", () => {
  const overview = { href: "/website-config", icon, title: "Overview" };
  const site = {
    href: "/website-config/site",
    icon,
    title: "Site information",
  };
  const parent = {
    children: [overview, site],
    icon,
    title: "Website configuration",
  };

  const activeHref = getActiveNavigationHref([parent], "/website-config/site");

  assert.equal(activeHref, "/website-config/site");
  assert.equal(isNavigationItemActive(overview, activeHref), false);
  assert.equal(isNavigationItemActive(site, activeHref), true);
});

test("keeps configured alternate routes active", () => {
  const warranties = {
    activeHrefs: ["/warranty-activation-requests"],
    href: "/warranties",
    icon,
    title: "Warranties",
  };

  const activeHref = getActiveNavigationHref(
    [warranties],
    "/warranty-activation-requests/pending",
  );

  assert.equal(activeHref, "/warranty-activation-requests");
  assert.equal(isNavigationItemActive(warranties, activeHref), true);
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
  const activeHref = getActiveNavigationHref(
    [warrantyGroup],
    "/warranty-activation-requests/request-id",
  );

  assert.equal(hasActiveNavigationDescendant(warrantyGroup, activeHref), true);
  assert.equal(
    hasActiveNavigationDescendant(
      warrantyGroup,
      getActiveNavigationHref([warrantyGroup], "/products"),
    ),
    false,
  );
});

test("surfaces a child notification badge on its parent group", () => {
  assert.equal(
    getNavigationItemBadge(
      warrantyGroup,
      {
        contactSubmissions: 0,
        unread: 4,
        warranties: 4,
        warrantyClaims: 0,
      },
      false,
    ),
    "4",
  );
  assert.equal(
    getNavigationItemBadge(
      warrantyGroup,
      {
        contactSubmissions: 0,
        unread: 4,
        warranties: 4,
        warrantyClaims: 0,
      },
      true,
    ),
    null,
  );
});

test("shows unread contact submissions on their navigation item", () => {
  assert.equal(
    getNavigationItemBadge(
      {
        href: "/contact-submissions",
        icon,
        notificationBadgeKey: "contactSubmissions",
        title: "Contact submissions",
      },
      {
        contactSubmissions: 3,
        unread: 3,
        warranties: 0,
        warrantyClaims: 0,
      },
      false,
    ),
    "3",
  );
});
