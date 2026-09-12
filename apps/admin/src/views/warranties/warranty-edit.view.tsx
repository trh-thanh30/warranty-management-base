"use client";

import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useWarrantyDetail } from "@/src/hooks/use-warranties";
import {
  WarrantyEditFormCard,
  WarrantyEditFormSkeleton,
} from "./components/warranty-edit-form-card";

type WarrantyEditViewProps = {
  warrantyId: string;
};

export function WarrantyEditView({ warrantyId }: WarrantyEditViewProps) {
  const t = useTranslations("Warranties");
  const warrantyQuery = useWarrantyDetail(warrantyId);
  const warranty = warrantyQuery.data;
  const detailHref = `/warranties/${warrantyId}`;
  const description = t("editDescription", {
    code: warranty?.warrantyCode ?? "-",
  });
  const isAdjustable =
    warranty?.status === "DRAFT" || warranty?.status === "ACTIVE";

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_UPDATE]}>
      <FormPageShell
        backHref={detailHref}
        backLabel={t("backToDetail")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("editTitle")}
      >
        {warrantyQuery.isLoading ? (
          <WarrantyEditFormSkeleton />
        ) : warrantyQuery.isError || !warranty ? (
          <EntityQueryState
            error={warrantyQuery.error}
            action={
              <Button
                onClick={() => {
                  void warrantyQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={PackageSearch}
            title={t("loadErrorTitle")}
          />
        ) : !isAdjustable ? (
          <StatePanel
            description={t("notAdjustableDescription")}
            icon={PackageSearch}
            title={t("notAdjustableTitle")}
          />
        ) : (
          <WarrantyEditFormCard warranty={warranty} />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
