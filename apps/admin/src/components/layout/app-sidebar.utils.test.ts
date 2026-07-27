import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveNavigationHref,
  getNavigationBadge,
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
