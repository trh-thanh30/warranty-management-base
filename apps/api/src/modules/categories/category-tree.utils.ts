import { toCategoryResponse } from '@/modules/categories/categories.types';
import { Category } from '@prisma/client';
import type {
  CategoryParentOption,
  CategorySortBy,
  CategoryTreeNode,
} from '@repo/shared';

type TreeFilter = {
  isActive?: boolean;
  search?: string;
};

export function buildCategoryTree(
  categories: Category[],
  input: {
    filter?: TreeFilter;
    sortBy?: CategorySortBy;
    sortOrder?: 'asc' | 'desc';
  } = {},
) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const childrenByParentId = new Map<string, Category[]>();
  const roots: Category[] = [];

  for (const category of categories) {
    if (
      category.parent_id &&
      category.parent_id !== category.id &&
      categoryById.has(category.parent_id)
    ) {
      const children = childrenByParentId.get(category.parent_id) ?? [];
      children.push(category);
      childrenByParentId.set(category.parent_id, children);
    } else {
      roots.push(category);
    }
  }

  const compare = createCategoryComparator(input.sortBy, input.sortOrder);
  const included = new Set<string>();
  const tree = roots
    .sort(compare)
    .map((category) =>
      buildNode(category, childrenByParentId, compare, input.filter, new Set()),
    )
    .filter(isCategoryTreeNode);

  visitTree(tree, (node) => included.add(node.id));

  for (const category of [...categories].sort(compare)) {
    if (included.has(category.id)) continue;
    const node = buildNode(
      category,
      childrenByParentId,
      compare,
      input.filter,
      new Set(),
    );
    if (!node) continue;
    tree.push(node);
    visitTree([node], (child) => included.add(child.id));
  }

  return tree;
}

export function buildCategoryParentOptions(
  categories: Category[],
  currentCategoryId?: string,
): CategoryParentOption[] {
  const excludedIds = collectDescendantIds(categories, currentCategoryId);
  const tree = buildCategoryTree(categories);
  const options: CategoryParentOption[] = [];

  const visit = (nodes: CategoryTreeNode[], path: string[]) => {
    for (const node of nodes) {
      const nextPath = [...path, node.name];
      if (!excludedIds.has(node.id)) {
        options.push({
          id: node.id,
          isActive: node.isActive,
          name: node.name,
          order: node.order,
          parentId: node.parentId,
          depth: path.length,
          path: nextPath,
        });
      }
      visit(node.children, nextPath);
    }
  };

  visit(tree, []);
  return options;
}

export function countCategoryTreeNodes(nodes: CategoryTreeNode[]) {
  let count = 0;
  visitTree(nodes, () => {
    count += 1;
  });
  return count;
}

function buildNode(
  category: Category,
  childrenByParentId: Map<string, Category[]>,
  compare: (left: Category, right: Category) => number,
  filter: TreeFilter | undefined,
  ancestors: Set<string>,
): CategoryTreeNode | null {
  if (ancestors.has(category.id)) return null;

  const nextAncestors = new Set(ancestors).add(category.id);
  const children = (childrenByParentId.get(category.id) ?? [])
    .sort(compare)
    .map((child) =>
      buildNode(child, childrenByParentId, compare, filter, nextAncestors),
    )
    .filter(isCategoryTreeNode);
  const matches = matchesCategoryFilter(category, filter);

  if (!matches && children.length === 0) return null;

  return {
    ...toCategoryResponse(category),
    createdAt: category.created_at.toISOString(),
    updatedAt: category.updated_at.toISOString(),
    children,
    ...(matches ? {} : { isContextOnly: true }),
  };
}

function matchesCategoryFilter(category: Category, filter?: TreeFilter) {
  if (!filter) return true;
  if (filter.isActive !== undefined && category.is_active !== filter.isActive) {
    return false;
  }

  const search = filter.search?.trim().toLocaleLowerCase('vi');
  if (!search) return true;

  return [category.name, category.code, category.slug, category.description]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase('vi').includes(search));
}

function collectDescendantIds(
  categories: Category[],
  currentCategoryId?: string,
) {
  const excluded = new Set<string>();
  if (!currentCategoryId) return excluded;

  const childrenByParentId = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parent_id) continue;
    const children = childrenByParentId.get(category.parent_id) ?? [];
    children.push(category.id);
    childrenByParentId.set(category.parent_id, children);
  }

  const pending = [currentCategoryId];
  while (pending.length > 0) {
    const categoryId = pending.pop();
    if (!categoryId || excluded.has(categoryId)) continue;
    excluded.add(categoryId);
    pending.push(...(childrenByParentId.get(categoryId) ?? []));
  }

  return excluded;
}

function createCategoryComparator(
  sortBy: CategorySortBy = 'order',
  sortOrder: 'asc' | 'desc' = 'asc',
) {
  const direction = sortOrder === 'desc' ? -1 : 1;

  return (left: Category, right: Category) => {
    const result = compareCategoryField(left, right, sortBy);
    if (result !== 0) return result * direction;
    return left.name.localeCompare(right.name, 'vi');
  };
}

function compareCategoryField(
  left: Category,
  right: Category,
  sortBy: CategorySortBy,
) {
  const values = {
    name: [left.name, right.name],
    slug: [left.slug, right.slug],
    order: [left.order, right.order],
    createdAt: [left.created_at.getTime(), right.created_at.getTime()],
    updatedAt: [left.updated_at.getTime(), right.updated_at.getTime()],
    isActive: [Number(left.is_active), Number(right.is_active)],
  } satisfies Record<CategorySortBy, [string | number, string | number]>;
  const [leftValue, rightValue] = values[sortBy];

  return typeof leftValue === 'string' && typeof rightValue === 'string'
    ? leftValue.localeCompare(rightValue, 'vi')
    : Number(leftValue) - Number(rightValue);
}

function isCategoryTreeNode(
  node: CategoryTreeNode | null,
): node is CategoryTreeNode {
  return node !== null;
}

function visitTree(
  nodes: CategoryTreeNode[],
  visitor: (node: CategoryTreeNode) => void,
) {
  for (const node of nodes) {
    visitor(node);
    visitTree(node.children, visitor);
  }
}
