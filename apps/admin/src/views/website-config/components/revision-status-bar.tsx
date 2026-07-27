"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Save, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WebsiteRevisionMeta } from "@repo/shared";
import { Badge, Button, Card, CardContent } from "@repo/ui";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type RevisionStatusBarProps = {
  canPublish: boolean;
  canSave: boolean;
  hasUnsavedChanges: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  onPublish: () => Promise<void> | void;
  onSave: () => Promise<void> | void;
  revision: WebsiteRevisionMeta;
};

export function RevisionStatusBar({
  canPublish,
  canSave,
  hasUnsavedChanges,
  isPublishing,
  isSaving,
  onPublish,
  onSave,
  revision,
}: RevisionStatusBarProps) {
  const t = useTranslations("WebsiteConfig");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const publishDisabled =
    hasUnsavedChanges ||
    isSaving ||
    isPublishing ||
    !revision.hasUnpublishedChanges;
  const publishDescriptionId = hasUnsavedChanges
    ? "website-config-publish-requirement"
    : undefined;

  return (
    <>
      <Card className="sticky top-20 z-30 border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
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
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="flex w-full gap-2 sm:w-auto">
              {canSave ? (
                <Button
                  className="min-h-11 flex-1 sm:min-h-9 sm:flex-none"
                  disabled={!hasUnsavedChanges || isSaving || isPublishing}
                  onClick={() => void onSave()}
                  type="button"
                  variant="outline"
                >
                  <Save aria-hidden="true" className="size-4" />
                  {isSaving ? t("actions.saving") : t("actions.saveDraft")}
                </Button>
              ) : null}
              {canPublish ? (
                <Button
                  aria-describedby={publishDescriptionId}
                  className="min-h-11 flex-1 sm:min-h-9 sm:flex-none"
                  disabled={publishDisabled}
                  onClick={() => setConfirmOpen(true)}
                  type="button"
                >
                  <Send aria-hidden="true" className="size-4" />
                  {isPublishing
                    ? t("actions.publishing")
                    : t("actions.publish")}
                </Button>
              ) : null}
            </div>
            {hasUnsavedChanges && canPublish ? (
              <p
                className="text-xs text-amber-700 dark:text-amber-300"
                id="website-config-publish-requirement"
              >
                {t("publish.saveBeforePublish")}
              </p>
            ) : null}
          </div>
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
