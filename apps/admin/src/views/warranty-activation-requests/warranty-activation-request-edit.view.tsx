"use client";

import { FormPageShell } from "@/src/components/common/form-page-shell";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import { useRouter } from "@/src/i18n/navigation";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FileSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateWarrantyActivationRequestFormCard } from "./components/create-warranty-activation-request-form-card";

export function WarrantyActivationRequestEditView({
  requestId,
}: {
  requestId: string;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const router = useRouter();
  const requestQuery = useWarrantyActivationRequest(requestId);
  const request = requestQuery.data;
  const detailHref = `/warranty-activation-requests/${requestId}`;
  const goToDetail = () => router.push(detailHref);

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_UPDATE]}>
      <FormPageShell
        backHref={detailHref}
        backLabel={t("backToDetail")}
        description={t("editDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("editTitle")}
      >
        {requestQuery.isLoading ? (
          <div className="h-96 animate-pulse rounded-lg border bg-slate-100 dark:bg-slate-900" />
        ) : requestQuery.isError || !request ? (
          <EntityQueryState
            error={requestQuery.error}
            action={
              <Button
                onClick={() => void requestQuery.refetch()}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FileSearch}
            title={t("loadErrorTitle")}
          />
        ) : request.status !== "PENDING" ? (
          <StatePanel
            description={t("editPendingOnlyDescription")}
            icon={FileSearch}
            title={t("editPending")}
          />
        ) : (
          <CreateWarrantyActivationRequestFormCard
            initialRequest={request}
            onCancel={goToDetail}
            onSaved={goToDetail}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
