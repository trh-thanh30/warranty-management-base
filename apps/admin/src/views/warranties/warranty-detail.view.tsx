"use client";

import { Ban, PackageSearch, Pencil, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useWarrantyDetail } from "@/src/hooks/use-warranties";
import { Link } from "@/src/i18n/navigation";
import { ActivateWarrantyDialog } from "./components/activate-warranty-dialog";
import { VoidWarrantyDialog } from "./components/void-warranty-dialog";
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
  const [voidOpen, setVoidOpen] = useState(false);
  const warranty = warrantyQuery.data;
  const canActivate =
    hasPermission(PERMISSIONS.WARRANTY_ACTIVATE) &&
    warranty?.status === "DRAFT" &&
    Boolean(warranty.warrantyCode);
  const canEdit =
    hasPermission(PERMISSIONS.WARRANTY_UPDATE) &&
    (warranty?.status === "DRAFT" || warranty?.status === "ACTIVE");
  const canVoid =
    hasPermission(PERMISSIONS.WARRANTY_VOID) &&
    (warranty?.status === "DRAFT" || warranty?.status === "ACTIVE");

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <FormPageShell
        backHref="/warranties"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        descriptionAccessory={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {canEdit ? (
              <Button asChild className="w-full sm:w-auto" variant="secondary">
                <Link href={`/warranties/${warranty.id}/edit`}>
                  <Pencil className="size-4" />
                  {t("edit")}
                </Link>
              </Button>
            ) : null}
            {canActivate ? (
              <Button
                className="w-full sm:w-auto"
                onClick={() => setActivateOpen(true)}
                type="button"
                variant="secondary"
              >
                <ShieldCheck className="size-4" />
                {t("activate")}
              </Button>
            ) : null}
            {canVoid ? (
              <Button
                className="w-full sm:w-auto"
                onClick={() => setVoidOpen(true)}
                type="button"
                variant="destructive"
              >
                <Ban className="size-4" />
                {t("void")}
              </Button>
            ) : null}
          </div>
        }
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("detailTitle")}
      >
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
        <VoidWarrantyDialog
          onOpenChange={setVoidOpen}
          onVoided={() => {
            void warrantyQuery.refetch();
          }}
          open={voidOpen}
          warranty={warranty ?? null}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
