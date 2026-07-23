"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContentPageStatus, ContentPageSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { Link } from "@/src/i18n/navigation";
import { ContentPagesDirectory } from "./components/content-pages-directory";
import { useContentPagesDirectory } from "./hooks/use-content-pages-directory";

export function ContentPagesView() {
  const t = useTranslations("ContentPages");
  const toast = useToast();
  const directory = useContentPagesDirectory();
  async function remove() {
    try {
      await directory.deletePage();
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  }
  function updateStatus(page: ContentPageSummary, status: ContentPageStatus) {
    directory.updateStatus(
      { id: page.id, status },
      {
        onError: () => {
          toast.error(t("statusUpdateError"));
        },
        onSuccess: () => {
          toast.success(t("statusUpdated"));
        },
      },
    );
  }
  return (
    <PermissionGuard permissions={[PERMISSIONS.CONTENT_PAGE_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            directory.canCreate ? (
              <Button asChild>
                <Link href="/content-pages/create">
                  <Plus className="size-4" />
                  {t("create")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />
        <ContentPagesDirectory
          canCreate={directory.canCreate}
          canDelete={directory.canDelete}
          canEdit={directory.canEdit}
          data={directory.query.data}
          isError={directory.query.isError}
          isLoading={directory.query.isLoading}
          kind={directory.kind}
          onClear={directory.resetControls}
          onDelete={directory.openDelete}
          onKindChange={directory.setKind}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onRetry={() => void directory.query.refetch()}
          onSearchChange={directory.setSearch}
          onSortChange={directory.toggleSort}
          onStatusChange={directory.setStatus}
          onStatusUpdate={updateStatus}
          pageSize={directory.pageSize}
          search={directory.search}
          sortBy={directory.sortBy}
          sortOrder={directory.sortOrder}
          status={directory.status}
        />
        <ConfirmActionDialog
          cancelLabel={t("cancel")}
          confirmDisabled={!directory.pageToDelete}
          confirmLabel={t("delete")}
          description={t("deleteDescription", {
            title: directory.pageToDelete?.title ?? "",
          })}
          isLoading={directory.isDeleting}
          onConfirm={() => void remove()}
          onOpenChange={(open) => {
            if (!open) directory.openDelete(null);
          }}
          open={Boolean(directory.pageToDelete)}
          title={t("deleteTitle")}
          variant="destructive"
        />
      </div>
    </PermissionGuard>
  );
}
