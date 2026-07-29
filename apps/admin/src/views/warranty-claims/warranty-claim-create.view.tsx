"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useRouter } from "@/src/i18n/navigation";
import { CreateWarrantyClaimFormCard } from "./components/create-warranty-claim-form-card";

export function WarrantyClaimCreateView() {
  const t = useTranslations("WarrantyClaims");
  const router = useRouter();
  const goBack = () => router.push("/warranty-claims");

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_CLAIM_CREATE]}>
      <FormPageShell
        backHref="/warranty-claims"
        backLabel={t("backToDirectory")}
        description={t("createDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("createTitle")}
      >
        <CreateWarrantyClaimFormCard
          onCancel={goBack}
          onCreated={(claimId) => router.push(`/warranty-claims/${claimId}`)}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
