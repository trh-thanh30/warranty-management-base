"use client";

import { PackageSearch, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useWarrantyDetail } from "@/src/hooks/use-warranties";
import { ActivateWarrantyDialog } from "./components/activate-warranty-dialog";
import {
  WarrantyDetailCard,
  WarrantyDetailSkeleton,
} from "./components/warranty-detail-card";

type WarrantyDetailViewProps = {
  warrantyId: string;
};

export function WarrantyDetailView({ warrantyId }: WarrantyDetailViewProps) {
  const t = useTranslations("Warranties");
  const { hasPermission } = usePermissions();
  const warrantyQuery = useWarrantyDetail(warrantyId);
  const [activateOpen, setActivateOpen] = useState(false);
  const warranty = warrantyQuery.data;
  const canActivate =
    hasPermission(PERMISSIONS.WARRANTY_ACTIVATE) &&
    warranty?.status === "DRAFT" &&
    Boolean(warranty.warrantyCode);

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <FormPageShell
        backHref="/warranties"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("detailTitle")}
      >
        <div className="flex justify-end">
          {canActivate ? (
            <Button
              onClick={() => setActivateOpen(true)}
              type="button"
              variant="secondary"
            >
              <ShieldCheck className="size-4" />
              {t("activate")}
            </Button>
          ) : null}
        </div>

        {warrantyQuery.isLoading ? (
          <WarrantyDetailSkeleton />
        ) : warrantyQuery.isError || !warranty ? (
          <StatePanel
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
        ) : (
          <WarrantyDetailCard warranty={warranty} />
        )}

        <ActivateWarrantyDialog
          onActivated={() => {
            void warrantyQuery.refetch();
          }}
          onOpenChange={setActivateOpen}
          open={activateOpen}
          warranty={warranty ?? null}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
