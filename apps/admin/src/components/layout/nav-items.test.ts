import assert from "node:assert/strict";
import test from "node:test";
import { Boxes, Layers3, Package } from "lucide-react";
import { flattenNavigationItems } from "./nav-items.ts";

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
