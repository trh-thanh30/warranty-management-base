"use client";

import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type {
  WarrantyActivationRequestSortBy,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
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
import type { WarrantyActivationRequestAction } from "../warranty-activation-requests.types";
import {
  formatActivationRequestCustomer,
  formatActivationRequestDate,
  formatActivationRequestProduct,
} from "../warranty-activation-requests.utils";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type WarrantyActivationRequestsTableProps = {
  items: WarrantyActivationRequestSummary[];
  onAction: (
    request: WarrantyActivationRequestSummary,
    action: WarrantyActivationRequestAction,
  ) => void;
  onDownloadCertificate: (request: WarrantyActivationRequestSummary) => void;
  onSortChange: (sortBy: WarrantyActivationRequestSortBy) => void;
  onViewCertificate: (request: WarrantyActivationRequestSummary) => void;
  sortBy?: WarrantyActivationRequestSortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantyActivationRequestsTable({
  items,
  onAction,
  onDownloadCertificate,
  onSortChange,
  onViewCertificate,
  sortBy,
  sortOrder,
}: WarrantyActivationRequestsTableProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((request) => (
          <WarrantyActivationRequestMobileCard
            key={request.id}
            onAction={onAction}
            onDownloadCertificate={onDownloadCertificate}
            onViewCertificate={onViewCertificate}
            request={request}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto overscroll-x-contain rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table className="min-w-[1180px]">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="requestCode"
                sortOrder={sortOrder}
              >
                {t("requestCode")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="warrantyCode"
                sortOrder={sortOrder}
              >
                {t("warrantyCode")}
              </SortableTableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("product")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="status"
                sortOrder={sortOrder}
              >
                {t("status")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="createdAt"
                sortOrder={sortOrder}
              >
                {t("createdAt")}
              </SortableTableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((request) => (
              <WarrantyActivationRequestTableRow
                key={request.id}
                onAction={onAction}
                onDownloadCertificate={onDownloadCertificate}
                onViewCertificate={onViewCertificate}
                request={request}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function WarrantyActivationRequestTableRow({
  onAction,
  onDownloadCertificate,
  onViewCertificate,
  request,
}: {
  onAction: WarrantyActivationRequestsTableProps["onAction"];
  onDownloadCertificate: WarrantyActivationRequestsTableProps["onDownloadCertificate"];
  onViewCertificate: WarrantyActivationRequestsTableProps["onViewCertificate"];
  request: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <TableRow>
      <TableCell>
        <Link
          className="font-mono text-xs font-medium text-slate-950 hover:underline dark:text-slate-50"
          href={`/warranty-activation-requests/${request.id}`}
        >
          {request.requestCode}
        </Link>
      </TableCell>
      <TableCell>
        <div className="font-mono text-xs">{request.warrantyCode}</div>
      </TableCell>
      <TableCell>
        <div className="max-w-[18rem]">
          <p className="truncate font-medium">{request.customerName}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {formatActivationRequestCustomer(request)}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[18rem]">
          <p className="truncate font-medium">{request.productName ?? "-"}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {formatActivationRequestProduct(request) || "-"}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <WarrantyActivationRequestStatusBadge
          label={t(`statuses.${request.status}`)}
          status={request.status}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatActivationRequestDate(request.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <WarrantyActivationRequestActions
          onAction={onAction}
          onDownloadCertificate={onDownloadCertificate}
          onViewCertificate={onViewCertificate}
          request={request}
        />
      </TableCell>
    </TableRow>
  );
}

function WarrantyActivationRequestMobileCard({
  onAction,
  onDownloadCertificate,
  onViewCertificate,
  request,
}: {
  onAction: WarrantyActivationRequestsTableProps["onAction"];
  onDownloadCertificate: WarrantyActivationRequestsTableProps["onDownloadCertificate"];
  onViewCertificate: WarrantyActivationRequestsTableProps["onViewCertificate"];
  request: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <article className="min-w-0 max-w-full rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {request.customerName}
          </p>
          <Link
            className="mt-1 block font-mono text-xs text-slate-500 hover:underline dark:text-slate-400"
            href={`/warranty-activation-requests/${request.id}`}
          >
            {request.requestCode}
          </Link>
        </div>
        <WarrantyActivationRequestActions
          onAction={onAction}
          onDownloadCertificate={onDownloadCertificate}
          onViewCertificate={onViewCertificate}
          request={request}
        />
      </div>

      <dl className="mt-3 space-y-2">
        <MobileStatusRow label={t("status")}>
          <WarrantyActivationRequestStatusBadge
            label={t(`statuses.${request.status}`)}
            status={request.status}
          />
        </MobileStatusRow>
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MobileField label={t("warrantyCode")} value={request.warrantyCode} />
        <MobileField
          label={t("createdAt")}
          value={formatActivationRequestDate(request.createdAt)}
        />
        <MobileField label={t("phone")} value={request.customerPhone} />
        <MobileField label={t("product")} value={request.productName ?? "-"} />
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
      <dt className="w-24 shrink-0 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
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

function WarrantyActivationRequestActions({
  onAction,
  onDownloadCertificate,
  onViewCertificate,
  request,
}: {
  onAction: WarrantyActivationRequestsTableProps["onAction"];
  onDownloadCertificate: WarrantyActivationRequestsTableProps["onDownloadCertificate"];
  onViewCertificate: WarrantyActivationRequestsTableProps["onViewCertificate"];
  request: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const { hasPermission } = usePermissions();
  const canReview =
    (request.status === "PENDING" || request.status === "APPROVED") &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const approveLabel =
    request.status === "APPROVED" ? t("activate") : t("approve");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { code: request.requestCode })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/warranty-activation-requests/${request.id}`}>
            <Eye className="mr-2 size-4" />
            {t("viewDetail")}
          </Link>
        </DropdownMenuItem>
        {request.certificate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onViewCertificate(request)}>
              <FileText className="mr-2 size-4" />
              {t("viewCertificate")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDownloadCertificate(request)}>
              <Download className="mr-2 size-4" />
              {t("downloadCertificate")}
            </DropdownMenuItem>
          </>
        ) : null}
        {canReview ? <DropdownMenuSeparator /> : null}
        {canReview ? (
          <DropdownMenuItem onSelect={() => onAction(request, "approve")}>
            <CheckCircle2 className="mr-2 size-4" />
            {approveLabel}
          </DropdownMenuItem>
        ) : null}
        {canReview && request.status === "PENDING" ? (
          <DropdownMenuItem onSelect={() => onAction(request, "reject")}>
            <XCircle className="mr-2 size-4" />
            {t("reject")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
