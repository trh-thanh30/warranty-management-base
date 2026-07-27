import assert from "node:assert/strict";
import test from "node:test";
import { Boxes, Layers3, Package } from "lucide-react";
import type { DashboardConfig } from "@/src/config/dashboard.types";
import { flattenNavigationItems, getNavItems } from "./nav-items.ts";

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

test("flattens nested navigation into navigable leaf items", () => {
  const items = [
    {
      title: "Products",
      icon: Package,
      children: [
        {
          title: "Templates",
          href: "/product-templates",
          icon: Layers3,
        },
        {
          title: "Products",
          href: "/products",
          icon: Boxes,
        },
      ],
    },
  ];

  assert.deepEqual(
    flattenNavigationItems(items).map((item) => item.href),
    ["/product-templates", "/products"],
  );
});
