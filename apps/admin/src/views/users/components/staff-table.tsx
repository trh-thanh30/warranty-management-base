"use client";

import { MoreHorizontal, ShieldCheck, UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UserAccountSummary } from "@repo/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { getInitials } from "@/src/utils/get-initials";

type StaffTableProps = {
  items: UserAccountSummary[];
  onEdit: (user: UserAccountSummary) => void;
  onPermissions: (user: UserAccountSummary) => void;
  onToggleStatus: (user: UserAccountSummary) => void;
};

type StaffTableActionProps = Pick<
  StaffTableProps,
  "onEdit" | "onPermissions" | "onToggleStatus"
>;

export function StaffTable({
  items,
  onEdit,
  onPermissions,
  onToggleStatus,
}: StaffTableProps) {
  const t = useTranslations("Staff");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((user) => (
          <StaffMobileCard
            key={user.id}
            onEdit={onEdit}
            onPermissions={onPermissions}
            onToggleStatus={onToggleStatus}
            user={user}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("staffMember")}</TableHead>
              <TableHead>{t("username")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("verified")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <StaffTableRow
                key={user.id}
                onEdit={onEdit}
                onPermissions={onPermissions}
                onToggleStatus={onToggleStatus}
                user={user}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function StaffTableRow({
  onEdit,
  onPermissions,
  onToggleStatus,
  user,
}: StaffTableActionProps & { user: UserAccountSummary }) {
  const t = useTranslations("Staff");

  return (
    <TableRow>
      <TableCell>
        <StaffMemberCell user={user} />
      </TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>
        <StaffStatusBadge status={user.status} />
      </TableCell>
      <TableCell>{user.isVerified ? t("yes") : t("no")}</TableCell>
      <TableCell>{formatStaffCreatedAt(user.createdAt)}</TableCell>
      <TableCell className="text-right">
        <StaffActionsMenu
          onEdit={onEdit}
          onPermissions={onPermissions}
          onToggleStatus={onToggleStatus}
          user={user}
        />
      </TableCell>
    </TableRow>
  );
}

function StaffMemberCell({ user }: { user: UserAccountSummary }) {
  const displayName = getStaffDisplayName(user);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        {user.avatarUrl ? (
          <AvatarImage alt={displayName} src={user.avatarUrl} />
        ) : null}
        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{displayName}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {user.email}
        </p>
      </div>
    </div>
  );
}

function StaffMobileCard({
  onEdit,
  onPermissions,
  onToggleStatus,
  user,
}: StaffTableActionProps & { user: UserAccountSummary }) {
  const t = useTranslations("Staff");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <StaffMemberCell user={user} />
        <StaffActionsMenu
          onEdit={onEdit}
          onPermissions={onPermissions}
          onToggleStatus={onToggleStatus}
          user={user}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("username")}
          </dt>
          <dd className="mt-1 truncate text-slate-950 dark:text-slate-50">
            {user.username}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("status")}
          </dt>
          <dd className="mt-1">
            <StaffStatusBadge status={user.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("verified")}
          </dt>
          <dd className="mt-1 text-slate-950 dark:text-slate-50">
            {user.isVerified ? t("yes") : t("no")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("createdAt")}
          </dt>
          <dd className="mt-1 text-slate-950 dark:text-slate-50">
            {formatStaffCreatedAt(user.createdAt)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function StaffStatusBadge({
  status,
}: {
  status: UserAccountSummary["status"];
}) {
  const t = useTranslations("Staff");

  return (
    <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
      {status === "ACTIVE" ? t("active") : t("inactive")}
    </Badge>
  );
}

function StaffActionsMenu({
  onEdit,
  onPermissions,
  onToggleStatus,
  user,
}: StaffTableActionProps & { user: UserAccountSummary }) {
  const t = useTranslations("Staff");
  const displayName = getStaffDisplayName(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: displayName })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(user)}>
          {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPermissions(user)}>
          <ShieldCheck className="mr-2 size-4" />
          {t("managePermissions")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
          <UserRoundX className="mr-2 size-4" />
          {user.status === "ACTIVE" ? t("deactivate") : t("activate")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getStaffDisplayName(user: UserAccountSummary) {
  return user.fullName || user.username;
}

function formatStaffCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(createdAt));
}
