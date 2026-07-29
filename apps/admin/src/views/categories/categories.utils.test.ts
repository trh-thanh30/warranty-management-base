import assert from "node:assert/strict";
import test from "node:test";
import type { CategoryTreeNode } from "@repo/shared";
import {
  flattenVisibleCategories,
  groupVisibleCategoryBranches,
} from "./categories.utils.ts";

const child: CategoryTreeNode = {
  id: "child",
  type: "PRODUCT",
  code: null,
  slug: "child",
  name: "Child",
  description: null,
  parentId: "root",
  icon: null,
  imageUrl: null,
  order: 20,
  isActive: true,
  metadata: null,
  createdAt: "2026-07-29T00:00:00.000Z",
  updatedAt: "2026-07-29T00:00:00.000Z",
  children: [],
};

const root: CategoryTreeNode = {
  ...child,
  id: "root",
  slug: "root",
  name: "Root",
  parentId: null,
  order: 10,
  children: [child],
};

test("flattens an expanded category tree in parent-child order", () => {
  const result = flattenVisibleCategories([root], new Set());

  assert.deepEqual(
    result.map(({ category, depth, parentName }) => ({
      id: category.id,
      depth,
      parentName,
    })),
    [
      { id: "root", depth: 0, parentName: null },
      { id: "child", depth: 1, parentName: "Root" },
    ],
  );
});

test("hides descendants of a collapsed category", () => {
  const result = flattenVisibleCategories([root], new Set(["root"]));

  assert.deepEqual(
    result.map(({ category }) => category.id),
    ["root"],
  );
});

test("keeps every visible descendant in the same display branch as its root", () => {
  const secondChild: CategoryTreeNode = {
    ...child,
    id: "second-child",
    name: "Second child",
    parentId: "second-root",
  };
  const secondRoot: CategoryTreeNode = {
    ...root,
    id: "second-root",
    name: "Second root",
    children: [secondChild],
  };

  const branches = groupVisibleCategoryBranches([root, secondRoot], new Set());

  assert.deepEqual(
    branches.map((branch) => branch.map(({ category }) => category.id)),
    [
      ["root", "child"],
      ["second-root", "second-child"],
    ],
  );
});
