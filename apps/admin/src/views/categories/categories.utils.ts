import type { CategoryResponse, CategoryTreeNode } from "@repo/shared";

export function getCategoryParentLabel(
  category: CategoryResponse,
  categories: CategoryResponse[],
) {
  if (!category.parentId) return null;

  const parent = categories.find((item) => item.id === category.parentId);

  return parent?.name ?? shortCategoryId(category.parentId);
}

export function getCategoryDisplayCode(category: CategoryResponse) {
  return category.code || "-";
}

export function flattenVisibleCategories(
  items: CategoryTreeNode[],
  collapsedIds: ReadonlySet<string>,
) {
  return groupVisibleCategoryBranches(items, collapsedIds).flat();
}

export function groupVisibleCategoryBranches(
  items: CategoryTreeNode[],
  collapsedIds: ReadonlySet<string>,
) {
  return items.map((root) => flattenVisibleCategoryBranch(root, collapsedIds));
}

function flattenVisibleCategoryBranch(
  root: CategoryTreeNode,
  collapsedIds: ReadonlySet<string>,
) {
  const visible: Array<{
    category: CategoryTreeNode;
    depth: number;
    parentName: string | null;
  }> = [];

  const visit = (
    category: CategoryTreeNode,
    depth: number,
    parentName: string | null,
  ) => {
    visible.push({ category, depth, parentName });
    if (!collapsedIds.has(category.id)) {
      for (const child of category.children) {
        visit(child, depth + 1, category.name);
      }
    }
  };

  visit(root, 0, null);
  return visible;
}

function shortCategoryId(categoryId: string) {
  return `${categoryId.slice(0, 8)}...`;
}
