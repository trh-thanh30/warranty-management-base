"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useRouter } from "@/src/i18n/navigation";
import { DealerFormCard } from "./components/dealer-form-card";
import { useDealerDetail } from "./hooks/use-dealer-detail";

type DealerFormViewProps =
  | {
      mode: "create";
      dealerId?: never;
    }
  | {
      mode: "edit";
      dealerId: string;
    };

export function DealerFormView({ dealerId, mode }: DealerFormViewProps) {
  const t = useTranslations("Dealers");
  const router = useRouter();
  const isEditing = mode === "edit";
  const { dealer, dealerQuery } = useDealerDetail(
    isEditing ? { dealerId, mode: "edit" } : { mode: "create" },
  );
  const backHref = "/dealers";

  function goBack() {
    router.push(backHref);
  }

  return (
    <PermissionGuard
      permissions={[
        isEditing ? PERMISSIONS.DEALER_UPDATE : PERMISSIONS.DEALER_CREATE,
      ]}
    >
      <FormPageShell
        backHref={backHref}
        backLabel={t("backToDirectory")}
        description={isEditing ? t("editDescription") : t("createDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-4xl"
        title={isEditing ? t("editTitle") : t("createTitle")}
      >
        {isEditing &&
        (dealerQuery.isError || (!dealerQuery.isLoading && !dealer)) ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void dealerQuery.refetch();
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
          <DealerFormCard
            dealer={dealer}
            description={
              isEditing ? t("editDescription") : t("createDescription")
            }
            isLoading={isEditing && dealerQuery.isLoading}
            onCancel={goBack}
            onSaved={goBack}
            title={isEditing ? t("editTitle") : t("createTitle")}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
