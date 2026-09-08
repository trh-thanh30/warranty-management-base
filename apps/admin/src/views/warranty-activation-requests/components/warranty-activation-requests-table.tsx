"use client";

import { ActivationCodeSummary } from "@/src/components/activation-code-summary";
import { CompactBadgeList } from "@/src/components/common";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
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
  TableScroll,
} from "@repo/ui";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  getActivationRequestActivationCodes,
  getActivationRequestProductNames,
  getActivationRequestWarrantyCodes,
} from "../warranty-activation-request-items.utils";
import type { WarrantyActivationRequestAction } from "../warranty-activation-requests.types";
import {
  formatActivationRequestCustomer,
  formatActivationRequestDate,
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
  const locale = useLocale();
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
            locale={locale}
          />
        ))}
      </div>

      <TableScroll className="hidden overscroll-x-contain rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table className="min-w-330 whitespace-nowrap">
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
              <TableHead>{t("activationCodeLabel")}</TableHead>

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
              <TableHead className="whitespace-nowrap text-right">
                {t("actions")}
              </TableHead>
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
                locale={locale}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function WarrantyActivationRequestTableRow({
  onAction,
  onDownloadCertificate,
  onViewCertificate,
  locale,
  request,
}: {
  onAction: WarrantyActivationRequestsTableProps["onAction"];
  onDownloadCertificate: WarrantyActivationRequestsTableProps["onDownloadCertificate"];
  onViewCertificate: WarrantyActivationRequestsTableProps["onViewCertificate"];
  locale: string;
  request: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <TableRow>
      <TableCell>
        <Link
          className="block max-w-52 truncate font-mono text-xs font-medium text-slate-950 hover:underline dark:text-slate-50"
          href={`/warranty-activation-requests/${request.id}`}
        >
          {request.requestCode}
        </Link>
      </TableCell>
      <TableCell>
        <CompactBadgeList
          items={getActivationRequestWarrantyCodes(request)}
          monospace
          overflowAriaLabel={(count) => t("showMoreWarrantyCodes", { count })}
        />
      </TableCell>
      <TableCell>
        <ActivationRequestCodeList request={request} />
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
        <CompactBadgeList
          items={getActivationRequestProductNames(request)}
          overflowAriaLabel={(count) => t("showMoreProducts", { count })}
          showItemTooltip
        />
      </TableCell>

      <TableCell>
        <WarrantyActivationRequestStatusBadge
          label={t(`statuses.${request.status}`)}
          status={request.status}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatActivationRequestDate(request.createdAt, locale)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
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
  locale,
  request,
}: {
  onAction: WarrantyActivationRequestsTableProps["onAction"];
  onDownloadCertificate: WarrantyActivationRequestsTableProps["onDownloadCertificate"];
  onViewCertificate: WarrantyActivationRequestsTableProps["onViewCertificate"];
  locale: string;
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
        <MobileField label={t("warrantyCode")}>
          <CompactBadgeList
            items={getActivationRequestWarrantyCodes(request)}
            monospace
            overflowAriaLabel={(count) => t("showMoreWarrantyCodes", { count })}
          />
        </MobileField>
        <MobileField
          label={t("createdAt")}
          value={formatActivationRequestDate(request.createdAt, locale)}
        />
        <MobileField label={t("phone")} value={request.customerPhone} />
        <MobileField label={t("product")}>
          <CompactBadgeList
            items={getActivationRequestProductNames(request)}
            overflowAriaLabel={(count) => t("showMoreProducts", { count })}
            showItemTooltip
          />
        </MobileField>
        <MobileField label={t("activationCodeLabel")}>
          <ActivationRequestCodeList request={request} />
        </MobileField>
      </dl>
    </article>
  );
}

function ActivationRequestCodeList({
  request,
}: {
  request: WarrantyActivationRequestSummary;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const activationCodes = getActivationRequestActivationCodes(request);

  if (activationCodes.length === 0) {
    return (
      <ActivationCodeSummary
        activationCode={null}
        notRequiredLabel={t("activationCodeNotRequired")}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {activationCodes.map((activationCode) => (
        <ActivationCodeSummary
          activationCode={activationCode}
          key={activationCode.id}
          notRequiredLabel={t("activationCodeNotRequired")}
        />
      ))}
    </div>
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

function MobileField({
  children,
  label,
  value,
}: {
  children?: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 min-w-0 text-slate-950 dark:text-slate-50">
        {children ?? <span className="block truncate">{value}</span>}
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
  const canUseParentCertificate =
    Boolean(request.certificate) && !request.items?.length;
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
        {canUseParentCertificate ? (
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
