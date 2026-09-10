"use client";

import { FolderTree } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { PermissionGuard } from "@/src/components/permission-guard";
import {
  CategoryFormCard,
  CategoryFormSkeleton,
} from "./components/category-form-card";
import { useCategoryDetail } from "./hooks/use-category-detail";
import { useCategoryFormWorkflow } from "./hooks/use-category-form-workflow";

type CategoryFormViewProps =
  | {
      categoryId?: never;
      mode: "create";
    }
  | {
      categoryId: string;
      mode: "edit";
    };

export function CategoryFormView({ categoryId, mode }: CategoryFormViewProps) {
  const t = useTranslations("Categories");
  const workflow = useCategoryFormWorkflow();
  const { category, categoryQuery, isEditing } = useCategoryDetail(
    mode === "edit" ? { categoryId, mode: "edit" } : { mode: "create" },
  );
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.CATEGORY_UPDATE
    : PERMISSIONS.CATEGORY_CREATE;
  const title = isEditing ? t("editTitle") : t("createTitle");
  const description = isEditing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/categories"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-4xl"
        title={title}
      >
        {isEditing && categoryQuery.isLoading ? (
          <CategoryFormSkeleton description={description} title={title} />
        ) : isEditing && (categoryQuery.isError || !category) ? (
          <EntityQueryState
            error={categoryQuery.error}
            action={
              <Button
                onClick={() => {
                  void categoryQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FolderTree}
            title={t("loadErrorTitle")}
          />
        ) : (
          <CategoryFormCard
            category={category}
            description={description}
            onCancel={workflow.goBackToDirectory}
            onSaved={workflow.handleSaved}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
