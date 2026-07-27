import assert from "node:assert/strict";
import test from "node:test";
import type { DashboardConfig } from "@/src/config/dashboard.types";
import { getNavItems } from "./nav-items.ts";

const icon = () => null;

test("includes nested sidebar destinations in searchable navigation", () => {
  const config = {
    brand: { description: "", logo: icon, name: "" },
    sidebarSections: [
      {
        items: [
          {
            children: [
              {
                href: "/website-config/site",
                icon,
                title: "Website information",
              },
            ],
            icon,
            title: "Website configuration",
          },
        ],
        label: "Website",
      },
    ],
    topNavigation: [],
    userMenu: { menuItems: [] },
  } satisfies DashboardConfig;

  assert.deepEqual(getNavItems(config), [
    {
      href: "/website-config/site",
      icon,
      title: "Website information",
    },
  ]);
});
