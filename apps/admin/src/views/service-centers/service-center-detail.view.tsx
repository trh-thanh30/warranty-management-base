"use client";

import { FormPageShell } from "@/src/components/common/form-page-shell";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useDeactivateServiceCenter } from "@/src/hooks/use-service-centers";
import { useToast } from "@/src/hooks/use-toast";
import { Link } from "@/src/i18n/navigation";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { Building2, Pencil, Power } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeactivateServiceCenterDialog } from "./components/deactivate-service-center-dialog";
import {
  ServiceCenterDetailCard,
  ServiceCenterDetailSkeleton,
} from "./components/service-center-detail-card";
import { useServiceCenterDetail } from "./hooks/use-service-center-detail";

export function ServiceCenterDetailView({
  serviceCenterId,
}: {
  serviceCenterId: string;
}) {
  const t = useTranslations("ServiceCenters");
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const { serviceCenter, serviceCenterQuery } = useServiceCenterDetail({
    mode: "detail",
    serviceCenterId,
  });
  const deactivateServiceCenter = useDeactivateServiceCenter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const canEdit = hasPermission(PERMISSIONS.SERVICE_CENTER_UPDATE);
  const canDeactivate =
    hasPermission(PERMISSIONS.SERVICE_CENTER_DELETE) && serviceCenter?.isActive;

  async function confirmDeactivate() {
    if (!serviceCenter) return;

    try {
      await deactivateServiceCenter.mutateAsync(serviceCenter.id);
      toast.success(t("deactivated"));
      setDeactivateOpen(false);
    } catch {
      toast.error(t("deactivateError"));
    }
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.SERVICE_CENTER_VIEW]}>
      <FormPageShell
        backHref="/service-centers"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        descriptionAccessory={
          canDeactivate || canEdit ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {canDeactivate ? (
                <Button
                  className="w-full cursor-pointer bg-red-50 text-red-500 transition-colors duration-300 hover:bg-red-100 sm:w-auto"
                  disabled={!serviceCenter}
                  onClick={() => setDeactivateOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  <Power className="size-4" />
                  {t("deactivate")}
                </Button>
              ) : null}
              {canEdit ? (
                <Button
                  className="w-full cursor-pointer bg-gray-100 text-gray-500 transition-colors duration-300 hover:bg-gray-200 sm:w-auto"
                  asChild
                >
                  <Link href={`/service-centers/${serviceCenterId}/edit`}>
                    <Pencil className="size-4" />
                    {t("edit")}
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null
        }
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("detailTitle")}
      >
        {serviceCenterQuery.isLoading ? (
          <ServiceCenterDetailSkeleton />
        ) : serviceCenterQuery.isError || !serviceCenter ? (
          <EntityQueryState
            error={serviceCenterQuery.error}
            action={
              <Button
                onClick={() => {
                  void serviceCenterQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={Building2}
            title={t("loadErrorTitle")}
          />
        ) : (
          <ServiceCenterDetailCard serviceCenter={serviceCenter} />
        )}

        <DeactivateServiceCenterDialog
          isDeactivating={deactivateServiceCenter.isPending}
          onConfirm={() => {
            void confirmDeactivate();
          }}
          onOpenChange={setDeactivateOpen}
          open={deactivateOpen}
          serviceCenter={serviceCenter}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
