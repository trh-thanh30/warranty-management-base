"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WebsiteRevisionMeta } from "@repo/shared";
import { Badge, Button, Card, CardContent } from "@repo/ui";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type RevisionStatusBarProps = {
  canPublish: boolean;
  isPublishing: boolean;
  onPublish: () => Promise<void> | void;
  revision: WebsiteRevisionMeta;
};

export function RevisionStatusBar({
  canPublish,
  isPublishing,
  onPublish,
  revision,
}: RevisionStatusBarProps) {
  const t = useTranslations("WebsiteConfig");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className="gap-1.5"
              variant={revision.hasUnpublishedChanges ? "secondary" : "default"}
            >
              {revision.hasUnpublishedChanges ? (
                <Clock3 aria-hidden="true" className="size-3.5" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
              )}
              {revision.hasUnpublishedChanges
                ? t("status.unpublishedChanges")
                : t("status.published")}
            </Badge>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t("status.draftVersion", {
                version: revision.draftVersion,
              })}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {revision.publishedVersion
                ? t("status.publishedVersion", {
                    version: revision.publishedVersion,
                  })
                : t("status.neverPublished")}
            </span>
          </div>
          {canPublish ? (
            <Button
              className="min-h-11 sm:min-h-9"
              disabled={isPublishing}
              onClick={() => setConfirmOpen(true)}
              type="button"
            >
              <Send aria-hidden="true" className="size-4" />
              {isPublishing ? t("actions.publishing") : t("actions.publish")}
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <ConfirmActionDialog
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("actions.publish")}
        description={t("publish.description")}
        isLoading={isPublishing}
        onConfirm={async () => {
          await onPublish();
          setConfirmOpen(false);
        }}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title={t("publish.title")}
      />
    </>
  );
}
