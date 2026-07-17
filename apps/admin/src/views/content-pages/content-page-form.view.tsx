"use client";

import { FileText } from "lucide-react";
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
import { PermissionGuard } from "@/src/components/permission-guard";
import { StatePanel } from "@/src/components/common/state-panel";
import { useRouter } from "@/src/i18n/navigation";
import { ContentPageForm } from "./components/content-page-form";
import { useContentPage } from "./hooks/use-content-pages";

type Props =
  | { mode: "create"; pageId?: never }
  | { mode: "edit"; pageId: string };

export function ContentPageFormView({ mode, pageId }: Props) {
  const t = useTranslations("ContentPages");
  const router = useRouter();
  const editing = mode === "edit";
  const query = useContentPage(editing ? pageId : null, { enabled: editing });
  const permission: PermissionKey = editing
    ? PERMISSIONS.CONTENT_PAGE_UPDATE
    : PERMISSIONS.CONTENT_PAGE_CREATE;
  const title = editing ? t("editTitle") : t("createTitle");
  const description = editing ? t("editDescription") : t("createDescription");
  const goBack = () => router.push("/content-pages");

  return (
    <PermissionGuard permissions={[permission]}>
      <FormPageShell
        backHref="/content-pages"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={title}
      >
        {editing && query.isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-5">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        ) : editing && (query.isError || !query.data) ? (
          <StatePanel
            action={
              <Button onClick={() => void query.refetch()} variant="secondary">
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FileText}
            title={t("loadErrorTitle")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentPageForm
                onCancel={goBack}
                onSaved={goBack}
                page={query.data ?? null}
              />
            </CardContent>
          </Card>
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
