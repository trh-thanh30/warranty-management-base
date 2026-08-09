"use client";

import {
  Building2,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Power,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type ServiceCenterSortBy,
  type ServiceCenterSummary,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
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
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { ServiceCenterStatusBadge } from "./service-center-status-badge";

type ServiceCentersTableProps = {
  items: ServiceCenterSummary[];
  onDeactivate: (serviceCenter: ServiceCenterSummary) => void;
  onSortChange: (sortBy: ServiceCenterSortBy) => void;
  sortBy?: ServiceCenterSortBy;
  sortOrder: "asc" | "desc";
};

export function ServiceCentersTable({
  items,
  onDeactivate,
  onSortChange,
  sortBy,
  sortOrder,
}: ServiceCentersTableProps) {
  const t = useTranslations("ServiceCenters");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((serviceCenter) => (
          <ServiceCenterMobileCard
            key={serviceCenter.id}
            onDeactivate={onDeactivate}
            serviceCenter={serviceCenter}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="name"
                sortOrder={sortOrder}
              >
                {t("serviceCenter")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="province"
                sortOrder={sortOrder}
              >
                {t("location")}
              </SortableTableHead>
              <TableHead>{t("contact")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="isActive"
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
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((serviceCenter) => (
              <ServiceCenterTableRow
                key={serviceCenter.id}
                onDeactivate={onDeactivate}
                serviceCenter={serviceCenter}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function ServiceCenterTableRow({
  onDeactivate,
  serviceCenter,
}: {
  onDeactivate: ServiceCentersTableProps["onDeactivate"];
  serviceCenter: ServiceCenterSummary;
}) {
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell>
        <ServiceCenterIdentity serviceCenter={serviceCenter} />
      </TableCell>
      <TableCell>
        <LocationSummary serviceCenter={serviceCenter} />
      </TableCell>
      <TableCell>
        <ContactSummary serviceCenter={serviceCenter} />
      </TableCell>
      <TableCell>
        <ServiceCenterStatusBadge isActive={serviceCenter.isActive} />
      </TableCell>
      <TableCell>{formatDate(serviceCenter.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <ServiceCenterActions
          onDeactivate={onDeactivate}
          serviceCenter={serviceCenter}
        />
      </TableCell>
    </TableRow>
  );
}

function ServiceCenterMobileCard({
  onDeactivate,
  serviceCenter,
}: {
  onDeactivate: ServiceCentersTableProps["onDeactivate"];
  serviceCenter: ServiceCenterSummary;
}) {
  const t = useTranslations("ServiceCenters");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <ServiceCenterIdentity serviceCenter={serviceCenter} />
        <ServiceCenterActions
          onDeactivate={onDeactivate}
          serviceCenter={serviceCenter}
        />
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("location")}
          </dt>
          <dd className="mt-1">
            <LocationSummary serviceCenter={serviceCenter} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("contact")}
          </dt>
          <dd className="mt-1">
            <ContactSummary serviceCenter={serviceCenter} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("status")}
          </dt>
          <dd className="mt-1">
            <ServiceCenterStatusBadge isActive={serviceCenter.isActive} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ServiceCenterActions({
  onDeactivate,
  serviceCenter,
}: {
  onDeactivate: ServiceCentersTableProps["onDeactivate"];
  serviceCenter: ServiceCenterSummary;
}) {
  const t = useTranslations("ServiceCenters");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.SERVICE_CENTER_UPDATE);
  const canDeactivate =
    serviceCenter.isActive && hasPermission(PERMISSIONS.SERVICE_CENTER_DELETE);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: serviceCenter.name })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/service-centers/${serviceCenter.id}`}>
            <Eye className="mr-2 size-4" />
            {t("viewDetail")}
          </Link>
        </DropdownMenuItem>
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/service-centers/${serviceCenter.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canDeactivate ? (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onSelect={() => onDeactivate(serviceCenter)}
          >
            <Power className="mr-2 size-4" />
            {t("deactivate")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ServiceCenterIdentity({
  serviceCenter,
}: {
  serviceCenter: ServiceCenterSummary;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        <Building2 className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{serviceCenter.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {serviceCenter.address}
        </p>
      </div>
    </div>
  );
}

function LocationSummary({
  serviceCenter,
}: {
  serviceCenter: ServiceCenterSummary;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <span className="line-clamp-2">
        {[serviceCenter.district, serviceCenter.province]
          .filter(Boolean)
          .join(", ")}
      </span>
    </div>
  );
}

function ContactSummary({
  serviceCenter,
}: {
  serviceCenter: ServiceCenterSummary;
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className="flex min-w-0 items-center gap-2">
        <Phone className="size-4 shrink-0 text-slate-400" />
        <span className="truncate">{serviceCenter.phone || "-"}</span>
      </p>
      <p className="flex min-w-0 items-center gap-2 text-slate-500 dark:text-slate-400">
        <Mail className="size-4 shrink-0" />
        <span className="truncate">{serviceCenter.email || "-"}</span>
      </p>
    </div>
  );
}
