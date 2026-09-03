"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { CreateWarrantyActivationRequestFormCard } from "./components/create-warranty-activation-request-form-card";

export function WarrantyActivationRequestCreateView() {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activationCodeId = searchParams.get("activationCodeId") ?? undefined;
  const activationCode = activationCodeId
    ? (searchParams.get("activationCode") ?? undefined)
    : undefined;
  const goBack = () => router.push("/warranty-activation-requests");

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <FormPageShell
        backHref="/warranty-activation-requests"
        backLabel={t("backToDirectory")}
        description={t("createDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("createTitle")}
      >
        <CreateWarrantyActivationRequestFormCard
          activationCodeId={activationCodeId}
          activationCode={activationCode}
          onCancel={goBack}
          onCreated={goBack}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
