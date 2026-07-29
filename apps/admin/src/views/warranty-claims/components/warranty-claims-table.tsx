"use client";

import {
  Building2,
  Eye,
  ListTodo,
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { WarrantyClaimSortBy, WarrantyClaimSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import {
  WARRANTY_CLAIM_STATUS_TRANSITIONS,
  WARRANTY_CLAIM_TERMINAL_STATUSES,
} from "../warranty-claims.constants";
import type { WarrantyClaimAction } from "../warranty-claims.types";
import {
  formatClaimCustomer,
  formatClaimDate,
  formatClaimProduct,
  formatClaimServiceCenter,
  isClaimOverdue,
} from "../warranty-claims.utils";
import {
  WarrantyClaimOverdueBadge,
  WarrantyClaimPriorityBadge,
  WarrantyClaimStatusBadge,
} from "./warranty-claim-badges";

type WarrantyClaimsTableProps = {
  items: WarrantyClaimSummary[];
  onAction: (claim: WarrantyClaimSummary, action: WarrantyClaimAction) => void;
  onSortChange: (sortBy: WarrantyClaimSortBy) => void;
  sortBy?: WarrantyClaimSortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantyClaimsTable({
  items,
  onAction,
  onSortChange,
  sortBy,
  sortOrder,
}: WarrantyClaimsTableProps) {
  const t = useTranslations("WarrantyClaims");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((claim) => (
          <WarrantyClaimMobileCard
            claim={claim}
            key={claim.id}
            onAction={onAction}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto overscroll-x-contain rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table className="min-w-[1360px]">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="claimCode"
                sortOrder={sortOrder}
              >
                {t("claimCode")}
              </SortableTableHead>
              <TableHead>{t("issue")}</TableHead>
              <TableHead>
                {t("customer")} / {t("product")}
              </TableHead>
              <TableHead>{t("serviceCenter")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="status"
                sortOrder={sortOrder}
              >
                {t("status")} / {t("priority")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="dueAt"
                sortOrder={sortOrder}
              >
                {t("slaLabel")}
              </SortableTableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((claim) => (
              <WarrantyClaimTableRow
                claim={claim}
                key={claim.id}
                onAction={onAction}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function WarrantyClaimTableRow({
  claim,
  onAction,
}: {
  claim: WarrantyClaimSummary;
  onAction: WarrantyClaimsTableProps["onAction"];
}) {
  const t = useTranslations("WarrantyClaims");

  return (
    <TableRow>
      <TableCell>
        <div className="font-mono text-xs">{claim.claimCode}</div>
        <div className="mt-1 font-mono text-xs text-slate-500">
          {claim.warrantyCode}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[18rem]">
          <p className="truncate font-medium">{claim.issueTitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("submittedAt")}: {formatClaimDate(claim.submittedAt)}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[15rem] space-y-1">
          <p className="truncate font-medium">{formatClaimCustomer(claim)}</p>
          <p className="truncate text-xs text-slate-500">
            {formatClaimProduct(claim)}
          </p>
        </div>
      </TableCell>
      <TableCell>{formatClaimServiceCenter(claim)}</TableCell>
      <TableCell className="min-w-[160px] whitespace-nowrap">
        <div className="flex flex-nowrap items-center gap-1.5">
          <WarrantyClaimStatusBadge status={claim.status} />
          <WarrantyClaimPriorityBadge priority={claim.priority} />
        </div>
      </TableCell>
      <TableCell className="min-w-[150px] whitespace-nowrap">
        <div className="space-y-1">
          <WarrantyClaimOverdueBadge claim={claim} />
          <p className="text-xs text-slate-500">
            {formatClaimDate(claim.dueAt)}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <WarrantyClaimActions claim={claim} onAction={onAction} />
      </TableCell>
    </TableRow>
  );
}

function WarrantyClaimMobileCard({
  claim,
  onAction,
}: {
  claim: WarrantyClaimSummary;
  onAction: WarrantyClaimsTableProps["onAction"];
}) {
  const t = useTranslations("WarrantyClaims");

  return (
    <article className="min-w-0 max-w-full rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {claim.issueTitle}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {claim.claimCode}
          </p>
        </div>
        <WarrantyClaimActions claim={claim} onAction={onAction} />
      </div>

      <dl className="mt-3 space-y-2">
        <MobileStatusRow label={t("status")}>
          <WarrantyClaimStatusBadge status={claim.status} />
        </MobileStatusRow>
        <MobileStatusRow label={t("priority")}>
          <WarrantyClaimPriorityBadge priority={claim.priority} />
        </MobileStatusRow>
        {isClaimOverdue(claim) ? (
          <MobileStatusRow label={t("slaLabel")}>
            <WarrantyClaimOverdueBadge claim={claim} />
          </MobileStatusRow>
        ) : null}
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MobileField label={t("customer")} value={formatClaimCustomer(claim)} />
        <MobileField
          label={t("serviceCenter")}
          value={formatClaimServiceCenter(claim)}
        />
        <MobileField label={t("dueAt")} value={formatClaimDate(claim.dueAt)} />
        <MobileField
          label={t("submittedAt")}
          value={formatClaimDate(claim.submittedAt)}
        />
      </dl>
    </article>
  );
}

function MobileStatusRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <dt className="w-20 shrink-0 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}

function WarrantyClaimActions({
  claim,
  onAction,
}: {
  claim: WarrantyClaimSummary;
  onAction: WarrantyClaimsTableProps["onAction"];
}) {
  const t = useTranslations("WarrantyClaims");
  const { hasPermission } = usePermissions();
  const isTerminal = WARRANTY_CLAIM_TERMINAL_STATUSES.includes(claim.status);
  const canUpdate =
    hasPermission(PERMISSIONS.WARRANTY_CLAIM_UPDATE) && !isTerminal;
  const canUpdateStatus =
    hasPermission(PERMISSIONS.WARRANTY_CLAIM_STATUS_UPDATE) &&
    WARRANTY_CLAIM_STATUS_TRANSITIONS[claim.status].length > 0;
  const hasOperationalActions = canUpdate || canUpdateStatus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { code: claim.claimCode })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/warranty-claims/${claim.id}`}>
            <Eye className="mr-2 size-4" />
            {t("viewDetail")}
          </Link>
        </DropdownMenuItem>
        {hasOperationalActions ? <DropdownMenuSeparator /> : null}
        {canUpdateStatus ? (
          <DropdownMenuItem onSelect={() => onAction(claim, "status")}>
            <ListTodo className="mr-2 size-4" />
            {t("updateStatus")}
          </DropdownMenuItem>
        ) : null}
        {canUpdate ? (
          <DropdownMenuItem
            onSelect={() => onAction(claim, "assignServiceCenter")}
          >
            <Building2 className="mr-2 size-4" />
            {t("assignServiceCenter")}
          </DropdownMenuItem>
        ) : null}
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onAction(claim, "priority")}>
            <SlidersHorizontal className="mr-2 size-4" />
            {t("updatePriority")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
