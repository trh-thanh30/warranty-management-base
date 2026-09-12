"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { PermissionGuard } from "@/src/components/permission-guard";
import {
  ServiceCenterFormCard,
  ServiceCenterFormSkeleton,
} from "./components/service-center-form-card";
import { useServiceCenterDetail } from "./hooks/use-service-center-detail";
import { useServiceCenterFormWorkflow } from "./hooks/use-service-center-form-workflow";

type ServiceCenterFormViewProps =
  | { mode: "create"; serviceCenterId?: never }
  | { mode: "edit"; serviceCenterId: string };

export function ServiceCenterFormView({
  mode,
  serviceCenterId,
}: ServiceCenterFormViewProps) {
  const t = useTranslations("ServiceCenters");
  const workflow = useServiceCenterFormWorkflow();
  const isEditing = mode === "edit";
  const detail = useServiceCenterDetail({
    mode: "edit",
    serviceCenterId: isEditing ? serviceCenterId : null,
  });
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.SERVICE_CENTER_UPDATE
    : PERMISSIONS.SERVICE_CENTER_CREATE;
  const title = isEditing ? t("editTitle") : t("createTitle");
  const description = isEditing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/service-centers"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        title={title}
      >
        {isEditing && detail.serviceCenterQuery.isLoading ? (
          <ServiceCenterFormSkeleton description={description} title={title} />
        ) : isEditing &&
          (detail.serviceCenterQuery.isError || !detail.serviceCenter) ? (
          <EntityQueryState
            error={detail.serviceCenterQuery.error}
            action={
              <Button
                onClick={() => {
                  void detail.serviceCenterQuery.refetch();
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
          <ServiceCenterFormCard
            description={description}
            onCancel={workflow.goBackToDirectory}
            onSaved={workflow.handleSaved}
            serviceCenter={isEditing ? detail.serviceCenter : null}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
