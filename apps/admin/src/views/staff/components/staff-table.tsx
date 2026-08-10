"use client";

import { MoreHorizontal, Pencil, ShieldCheck, UserRoundX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type ListUsersQuery,
  type UserAccountSummary,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
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
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { getInitials } from "@/src/utils/get-initials";

type StaffTableProps = {
  items: UserAccountSummary[];
  onPermissions: (user: UserAccountSummary) => void;
  onSortChange: (sortBy: StaffSortBy) => void;
  onToggleStatus: (user: UserAccountSummary) => void;
  sortBy?: StaffSortBy;
  sortOrder: "asc" | "desc";
};

type StaffSortBy = NonNullable<ListUsersQuery["sortBy"]>;

type StaffTableActionProps = Pick<
  StaffTableProps,
  "onPermissions" | "onToggleStatus"
>;

export function StaffTable({
  items,
  onPermissions,
  onSortChange,
  onToggleStatus,
  sortBy,
  sortOrder,
}: StaffTableProps) {
  const locale = useLocale();
  const t = useTranslations("Staff");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((user) => (
          <StaffMobileCard
            key={user.id}
            onPermissions={onPermissions}
            onToggleStatus={onToggleStatus}
            user={user}
          />
        ))}
      </div>

      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="fullName"
                sortOrder={sortOrder}
              >
                {t("staffMember")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="username"
                sortOrder={sortOrder}
              >
                {t("username")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="status"
                sortOrder={sortOrder}
              >
                {t("status")}
              </SortableTableHead>
              <TableHead>{t("verified")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="createdAt"
                sortOrder={sortOrder}
              >
                {t("createdAt")}
              </SortableTableHead>
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <StaffTableRow
                key={user.id}
                onPermissions={onPermissions}
                onToggleStatus={onToggleStatus}
                locale={locale}
                user={user}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function StaffTableRow({
  onPermissions,
  onToggleStatus,
  locale,
  user,
}: StaffTableActionProps & { locale: string; user: UserAccountSummary }) {
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
      <TableCell>{formatDate(user.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <StaffActionsMenu
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
  onPermissions,
  onToggleStatus,
  user,
}: StaffTableActionProps & { user: UserAccountSummary }) {
  const locale = useLocale();
  const t = useTranslations("Staff");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <StaffMemberCell user={user} />
        <StaffActionsMenu
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
            {formatDate(user.createdAt, { locale })}
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
  onPermissions,
  onToggleStatus,
  user,
}: StaffTableActionProps & { user: UserAccountSummary }) {
  const t = useTranslations("Staff");
  const displayName = getStaffDisplayName(user);
  const { hasPermission, hasRole } = usePermissions();
  const canManageStaff = hasRole("admin");
  const canEdit = canManageStaff && hasPermission(PERMISSIONS.USER_UPDATE);
  const canManagePermissions =
    canManageStaff && hasPermission(PERMISSIONS.USER_PERMISSION_MANAGE);
  const canToggleStatus =
    canManageStaff && hasPermission(PERMISSIONS.USER_UPDATE);

  if (!canEdit && !canManagePermissions && !canToggleStatus) {
    return null;
  }

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
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/staffs/${user.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canManagePermissions ? (
          <DropdownMenuItem onSelect={() => onPermissions(user)}>
            <ShieldCheck className="mr-2 size-4" />
            {t("managePermissions")}
          </DropdownMenuItem>
        ) : null}
        {canToggleStatus ? (
          <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
            <UserRoundX className="mr-2 size-4" />
            {user.status === "ACTIVE" ? t("deactivate") : t("activate")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getStaffDisplayName(user: UserAccountSummary) {
  return user.fullName || user.username;
}
