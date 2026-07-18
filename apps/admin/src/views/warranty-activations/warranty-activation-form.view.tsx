"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PermissionGuard } from "@/src/components/permission-guard";
import { WarrantyActivationFormCard } from "./components/warranty-activation-form-card";
import { useWarrantyActivationFormWorkflow } from "./hooks/use-warranty-activation-form-workflow";

export function WarrantyActivationFormView() {
  const t = useTranslations("WarrantyActivations");
  const workflow = useWarrantyActivationFormWorkflow();

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_ACTIVATE]}>
      <FormPageShell
        backHref="/warranties"
        backLabel={t("backToWarranties")}
        description={t("createDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("createTitle")}
      >
        <WarrantyActivationFormCard
          onCancel={workflow.goBackToWarranties}
          onSaved={workflow.handleSaved}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
