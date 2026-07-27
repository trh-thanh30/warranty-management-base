"use client";

import { Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useProductTemplate } from "@/src/hooks/use-product-templates";
import { useRouter } from "@/src/i18n/navigation";
import { ProductTemplateForm } from "./components/product-template-form";

type Props =
  | { mode: "create"; templateId?: never }
  | { mode: "edit"; templateId: string };

export function ProductTemplateFormView({ mode, templateId }: Props) {
  const t = useTranslations("ProductTemplates");
  const router = useRouter();
  const editing = mode === "edit";
  const templateQuery = useProductTemplate(templateId ?? null, {
    enabled: editing,
  });
  const template = editing ? (templateQuery.data ?? null) : null;
  const requiredPermission: PermissionKey = editing
    ? PERMISSIONS.PRODUCT_TEMPLATE_UPDATE
    : PERMISSIONS.PRODUCT_TEMPLATE_CREATE;
  const title = editing ? t("editTitle") : t("createTitle");
  const description = editing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/product-templates"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={title}
      >
        {editing && templateQuery.isLoading ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-16" />
              <Skeleton className="h-40" />
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        ) : editing && (templateQuery.isError || !template) ? (
          <StatePanel
            action={
              <Button onClick={() => void templateQuery.refetch()}>
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={Layers3}
            title={t("loadErrorTitle")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTemplateForm
                onCancel={() => router.push("/product-templates")}
                onSaved={() => router.push("/product-templates")}
                template={template}
              />
            </CardContent>
          </Card>
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
