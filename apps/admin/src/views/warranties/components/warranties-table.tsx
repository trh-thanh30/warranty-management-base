"use client";

import { Ban, Eye, MoreHorizontal, Pencil, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, type WarrantyListItem } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { WarrantySortBy } from "../warranties.types";
import {
  formatWarrantyOwner,
  getWarrantyProductDisplayName,
} from "../warranties.utils";
import { WarrantyStatusBadge } from "./warranty-status-badge";
import { ActivationCodeSummary } from "@/src/components/activation-code-summary";

type WarrantiesTableProps = {
  items: WarrantyListItem[];
  onActivate: (warranty: WarrantyListItem) => void;
  onVoid: (warranty: WarrantyListItem) => void;
  onSortChange: (sortBy: WarrantySortBy) => void;
  sortBy?: WarrantySortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantiesTable({
  items,
  onActivate,
  onVoid,
  onSortChange,
  sortBy,
  sortOrder,
}: WarrantiesTableProps) {
  const locale = useLocale();
  const t = useTranslations("Warranties");

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.map((warranty) => (
          <WarrantyMobileCard
            key={warranty.id}
            onActivate={onActivate}
            onVoid={onVoid}
            warranty={warranty}
          />
        ))}
      </div>

      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table className="min-w-[1440px] whitespace-nowrap [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t("product")}</TableHead>
              <TableHead>{t("owner")}</TableHead>
              <TableHead>{t("dealer")}</TableHead>
              <TableHead>{t("warrantyCode")}</TableHead>
              <TableHead>{t("activationCode")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="startDate"
                sortOrder={sortOrder}
              >
                {t("startDate")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="endDate"
                sortOrder={sortOrder}
              >
                {t("endDate")}
              </SortableTableHead>
              <TableHead>{t("duration")}</TableHead>
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
            {items.map((warranty) => (
              <WarrantyTableRow
                key={warranty.id}
                onActivate={onActivate}
                onVoid={onVoid}
                locale={locale}
                warranty={warranty}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function WarrantyTableRow({
  onActivate,
  onVoid,
  locale,
  warranty,
}: {
  onActivate: WarrantiesTableProps["onActivate"];
  onVoid: WarrantiesTableProps["onVoid"];
  locale: string;
  warranty: WarrantyListItem;
}) {
  const t = useTranslations("Warranties");

  return (
    <TableRow>
      <TableCell>
        <WarrantyProductName warranty={warranty} />
      </TableCell>
      <TableCell>
        <span className="block max-w-52 truncate">
          {formatWarrantyOwner(warranty)}
        </span>
      </TableCell>
      <TableCell>
        <span className="block max-w-52 truncate">
          {warranty.dealer?.name ?? "-"}
        </span>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {warranty.warrantyCode ?? "-"}
      </TableCell>
      <TableCell>
        <ActivationCodeSummary
          activationCode={warranty.activationCode}
          notRequiredLabel={t("activationCodeNotRequired")}
        />
      </TableCell>
      <TableCell>
        <WarrantyStatusBadge status={warranty.status} />
      </TableCell>
      <TableCell>
        {formatDate(warranty.startDate, { locale, showTime: true })}
      </TableCell>
      <TableCell>
        {formatDate(warranty.endDate, { locale, showTime: true })}
      </TableCell>
      <TableCell>
        {t("durationValue", { count: warranty.durationMonths })}
      </TableCell>
      <TableCell>{formatDate(warranty.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <WarrantyActions
          onActivate={onActivate}
          onVoid={onVoid}
          warranty={warranty}
        />
      </TableCell>
    </TableRow>
  );
}

function WarrantyMobileCard({
  onActivate,
  onVoid,
  warranty,
}: {
  onActivate: WarrantiesTableProps["onActivate"];
  onVoid: WarrantiesTableProps["onVoid"];
  warranty: WarrantyListItem;
}) {
  const locale = useLocale();
  const t = useTranslations("Warranties");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <WarrantyProductName warranty={warranty} />
      <div className="mt-4 flex items-center gap-2">
        <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          {t("status")}
        </p>
        <WarrantyStatusBadge status={warranty.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <WarrantyMobileField
          label={t("warrantyCode")}
          value={warranty.warrantyCode ?? "-"}
        />
        <div className="min-w-0">
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("activationCode")}
          </dt>
          <dd className="mt-1">
            <ActivationCodeSummary
              activationCode={warranty.activationCode}
              notRequiredLabel={t("activationCodeNotRequired")}
            />
          </dd>
        </div>
        <WarrantyMobileField
          label={t("owner")}
          value={formatWarrantyOwner(warranty)}
        />
        <WarrantyMobileField
          label={t("dealer")}
          value={warranty.dealer?.name ?? "-"}
        />
        <WarrantyMobileField
          label={t("startDate")}
          value={formatDate(warranty.startDate, { locale, showTime: true })}
        />
        <WarrantyMobileField
          label={t("endDate")}
          value={formatDate(warranty.endDate, { locale, showTime: true })}
        />
      </dl>
      <div className="mt-4 flex justify-end">
        <WarrantyActions
          onActivate={onActivate}
          onVoid={onVoid}
          warranty={warranty}
        />
      </div>
    </article>
  );
}

function WarrantyProductName({ warranty }: { warranty: WarrantyListItem }) {
  return (
    <div className="min-w-0 lg:max-w-64">
      <Link
        className="block truncate font-medium text-slate-950 hover:underline dark:text-slate-50"
        href={`/warranties/${warranty.id}`}
      >
        {warranty.product.name}
      </Link>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
        {getWarrantyProductDisplayName(warranty)}
      </p>
    </div>
  );
}

function WarrantyMobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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

function WarrantyActions({
  onActivate,
  onVoid,
  warranty,
}: {
  onActivate: WarrantiesTableProps["onActivate"];
  onVoid: WarrantiesTableProps["onVoid"];
  warranty: WarrantyListItem;
}) {
  const t = useTranslations("Warranties");
  const { hasPermission } = usePermissions();
  const canActivate = hasPermission(PERMISSIONS.WARRANTY_ACTIVATE);
  const canEdit =
    hasPermission(PERMISSIONS.WARRANTY_UPDATE) &&
    (warranty.status === "DRAFT" || warranty.status === "ACTIVE");
  const canActivateCurrentWarranty =
    canActivate &&
    warranty.status === "DRAFT" &&
    Boolean(warranty.warrantyCode);
  const canVoid =
    hasPermission(PERMISSIONS.WARRANTY_VOID) &&
    (warranty.status === "DRAFT" || warranty.status === "ACTIVE");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { code: warranty.warrantyCode ?? "-" })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/warranties/${warranty.id}`}>
            <Eye className="mr-2 size-4" />
            {t("viewWarranty")}
          </Link>
        </DropdownMenuItem>
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/warranties/${warranty.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canActivateCurrentWarranty ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onActivate(warranty)}>
              <ShieldCheck className="mr-2 size-4" />
              {t("activate")}
            </DropdownMenuItem>
          </>
        ) : null}
        {canVoid ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              onSelect={() => onVoid(warranty)}
            >
              <Ban className="mr-2 size-4" />
              {t("void")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
