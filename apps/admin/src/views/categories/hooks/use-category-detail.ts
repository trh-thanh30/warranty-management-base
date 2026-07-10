"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useCategory } from "./use-categories";

type CategoryDetailOptions =
  | {
      categoryId?: never;
      mode: "create";
    }
  | {
      categoryId: string;
      mode: "edit";
    };

export function useCategoryDetail({ categoryId, mode }: CategoryDetailOptions) {
  const { hasPermission } = usePermissions();
  const isEditing = mode === "edit";
  const editCategoryId = isEditing ? categoryId : null;
  const canLoadCategoryDetail =
    isEditing && hasPermission(PERMISSIONS.CATEGORY_UPDATE);
  const categoryQuery = useCategory(editCategoryId, {
    enabled: canLoadCategoryDetail && editCategoryId !== null,
  });

  return {
    category: isEditing ? (categoryQuery.data ?? null) : null,
    categoryQuery,
    isEditing,
  };
}
