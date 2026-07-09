"use client";

import { UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PermissionGuard } from "@/src/components/permission-guard";
import { StatePanel } from "@/src/components/common/state-panel";
import {
  CustomerFormCard,
  CustomerFormSkeleton,
} from "./components/customer-form-card";
import { useCustomerDetail } from "./use-customer-detail";
import { useCustomerFormWorkflow } from "./use-customer-form-workflow";

type CustomerFormViewProps =
  | {
      customerId?: never;
      mode: "create";
    }
  | {
      customerId: string;
      mode: "edit";
    };

export function CustomerFormView({ customerId, mode }: CustomerFormViewProps) {
  const t = useTranslations("Customers");
  const workflow = useCustomerFormWorkflow();
  const { customer, customerQuery, isEditing } = useCustomerDetail(
    mode === "edit" ? { customerId, mode: "edit" } : { mode: "create" },
  );
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.CUSTOMER_UPDATE
    : PERMISSIONS.CUSTOMER_CREATE;
  const title = isEditing ? t("editTitle") : t("createTitle");
  const description = isEditing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/customers"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        title={title}
      >
        {isEditing && customerQuery.isLoading ? (
          <CustomerFormSkeleton description={description} title={title} />
        ) : isEditing && (customerQuery.isError || !customer) ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void customerQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={UserRoundX}
            title={t("loadErrorTitle")}
          />
        ) : (
          <CustomerFormCard
            customer={customer}
            description={description}
            onCancel={workflow.goBackToDirectory}
            onSaved={workflow.handleSaved}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
