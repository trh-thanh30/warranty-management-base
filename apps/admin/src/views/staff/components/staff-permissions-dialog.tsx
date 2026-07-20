"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  MODERATOR_PERMISSION_GROUPS,
  type PermissionKey,
} from "@repo/shared/constants";
import type { UserAccountSummary } from "@repo/shared";
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Skeleton,
} from "@repo/ui";
import { formatPermissionLabel } from "../staff.utils";
import { useStaffPermissions } from "../hooks/use-staff-permissions";

type ModeratorPermissionGroup = (typeof MODERATOR_PERMISSION_GROUPS)[number];

type StaffPermissionsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: UserAccountSummary | null;
};

export function StaffPermissionsDialog({
  onOpenChange,
  open,
  user,
}: StaffPermissionsDialogProps) {
  const t = useTranslations("Staff");
  const {
    isSaving,
    permissionsQuery,
    restoreDefaults,
    save,
    selected,
    toggle,
  } = useStaffPermissions({ open, user, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-dvh max-h-dvh w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(calc(100vw-2rem),52rem)] sm:rounded-lg">
        <div className="shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:border-b-0 sm:px-6 sm:pb-0">
          <DialogTitle className="text-lg font-semibold sm:text-xl">
            {t("permissionsTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("permissionsDescription", {
              name: user?.fullName || user?.username || "",
            })}
          </DialogDescription>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-0">
          <PermissionsContent
            isError={permissionsQuery.isError}
            isLoading={permissionsQuery.isLoading}
            onToggle={toggle}
            selected={selected}
          />
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:border-t-0 sm:px-6 sm:pb-6 sm:pt-0">
          <PermissionsActions
            canSave={!permissionsQuery.isLoading && !permissionsQuery.isError}
            isLoading={permissionsQuery.isLoading}
            isSaving={isSaving}
            onRestoreDefaults={restoreDefaults}
            onSave={save}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsContent({
  isError,
  isLoading,
  onToggle,
  selected,
}: {
  isError: boolean;
  isLoading: boolean;
  onToggle: (permission: PermissionKey, checked: boolean) => void;
  selected: ReadonlySet<PermissionKey>;
}) {
  const t = useTranslations("Staff");

  if (isLoading) {
    return <PermissionsSkeleton />;
  }

  if (isError) {
    return (
      <div
        className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        role="alert"
      >
        {t("permissionsLoadError")}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:mt-6 sm:grid-cols-2">
      {MODERATOR_PERMISSION_GROUPS.map((group) => (
        <PermissionGroup
          group={group}
          key={group.key}
          onToggle={onToggle}
          selected={selected}
        />
      ))}
    </div>
  );
}

function PermissionsSkeleton() {
  return (
    <div className="grid gap-4 sm:mt-6 sm:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-36" key={index} />
      ))}
    </div>
  );
}

function PermissionGroup({
  group,
  onToggle,
  selected,
}: {
  group: ModeratorPermissionGroup;
  onToggle: (permission: PermissionKey, checked: boolean) => void;
  selected: ReadonlySet<PermissionKey>;
}) {
  const t = useTranslations("Staff");

  return (
    <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-sm font-semibold">
        {t(`permissionGroups.${group.key}`)}
      </h3>
      <div className="mt-4 space-y-3">
        {group.permissions.map((permission) => (
          <PermissionCheckbox
            checked={selected.has(permission)}
            key={permission}
            onToggle={onToggle}
            permission={permission}
          />
        ))}
      </div>
    </section>
  );
}

function PermissionCheckbox({
  checked,
  onToggle,
  permission,
}: {
  checked: boolean;
  onToggle: (permission: PermissionKey, checked: boolean) => void;
  permission: PermissionKey;
}) {
  const t = useTranslations("Staff");
  const id = `permission-${permission}`;
  const permissionLabelKey = `permissionLabels.${permission}`;

  return (
    <div className="flex items-start gap-3">
      <Checkbox
        checked={checked}
        id={id}
        onCheckedChange={(nextChecked) =>
          onToggle(permission, nextChecked === true)
        }
      />
      <Label
        className="cursor-pointer text-sm font-normal leading-4"
        htmlFor={id}
      >
        {t.has(permissionLabelKey)
          ? t(permissionLabelKey)
          : formatPermissionLabel(permission)}
      </Label>
    </div>
  );
}

function PermissionsActions({
  canSave,
  isLoading,
  isSaving,
  onRestoreDefaults,
  onSave,
}: {
  canSave: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onRestoreDefaults: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("Staff");

  return (
    <div className="flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-between">
      <Button
        disabled={isLoading || isSaving}
        onClick={onRestoreDefaults}
        type="button"
        variant="ghost"
      >
        <RotateCcw className="size-4" />
        {t("restoreDefaults")}
      </Button>
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button
            className="flex-1 sm:flex-none"
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
        </DialogClose>
        <Button
          className="flex-1 sm:flex-none"
          disabled={!canSave || isSaving}
          onClick={onSave}
          type="button"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("savePermissions")}
        </Button>
      </div>
    </div>
  );
}
