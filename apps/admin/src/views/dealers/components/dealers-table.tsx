"use client";

import {
  Building2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Power,
  Users,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type DealerResponse,
  type DealerSortBy,
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
import { DealerStatusBadge } from "./dealer-status-badge";

type DealersTableProps = {
  items: DealerResponse[];
  onDeactivate: (dealer: DealerResponse) => void;
  onSortChange: (sortBy: DealerSortBy) => void;
  sortBy?: DealerSortBy;
  sortOrder: "asc" | "desc";
};

export function DealersTable({
  items,
  onDeactivate,
  onSortChange,
  sortBy,
  sortOrder,
}: DealersTableProps) {
  const t = useTranslations("Dealers");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((dealer) => (
          <DealerMobileCard
            dealer={dealer}
            key={dealer.id}
            onDeactivate={onDeactivate}
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
                {t("dealer")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="province"
                sortOrder={sortOrder}
              >
                {t("province")}
              </SortableTableHead>
              <TableHead>{t("contact")}</TableHead>
              <TableHead>{t("salesName")}</TableHead>
              <TableHead>{t("status")}</TableHead>
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
            {items.map((dealer) => (
              <DealerTableRow
                dealer={dealer}
                key={dealer.id}
                onDeactivate={onDeactivate}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function DealerTableRow({
  dealer,
  onDeactivate,
}: {
  dealer: DealerResponse;
  onDeactivate: DealersTableProps["onDeactivate"];
}) {
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell>
        <DealerIdentity dealer={dealer} />
      </TableCell>
      <TableCell>
        <LocationSummary dealer={dealer} />
      </TableCell>
      <TableCell>
        <ContactSummary dealer={dealer} />
      </TableCell>
      <TableCell>{dealer.salesName ?? "-"}</TableCell>
      <TableCell>
        <DealerStatusBadge isActive={dealer.isActive} />
      </TableCell>
      <TableCell>{formatDate(dealer.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <DealerActions dealer={dealer} onDeactivate={onDeactivate} />
      </TableCell>
    </TableRow>
  );
}

function DealerMobileCard({
  dealer,
  onDeactivate,
}: {
  dealer: DealerResponse;
  onDeactivate: DealersTableProps["onDeactivate"];
}) {
  const t = useTranslations("Dealers");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <DealerIdentity dealer={dealer} />
        <DealerActions dealer={dealer} onDeactivate={onDeactivate} />
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("province")}
          </dt>
          <dd className="mt-1">
            <LocationSummary dealer={dealer} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("contact")}
          </dt>
          <dd className="mt-1">
            <ContactSummary dealer={dealer} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("salesName")}
          </dt>
          <dd className="mt-1">{dealer.salesName ?? "-"}</dd>
        </div>
      </dl>
    </article>
  );
}

function DealerActions({
  dealer,
  onDeactivate,
}: {
  dealer: DealerResponse;
  onDeactivate: DealersTableProps["onDeactivate"];
}) {
  const t = useTranslations("Dealers");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.DEALER_UPDATE);
  const canDeactivate =
    dealer.isActive && hasPermission(PERMISSIONS.DEALER_DELETE);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: dealer.name })}
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
            <Link href={`/dealers/${dealer.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href={`/dealers/${dealer.id}/activated-customers`}>
            <Users className="mr-2 size-4" />
            {t("viewActivatedCustomers")}
          </Link>
        </DropdownMenuItem>
        {canDeactivate ? (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onSelect={() => onDeactivate(dealer)}
          >
            <Power className="mr-2 size-4" />
            {t("deactivate")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DealerIdentity({ dealer }: { dealer: DealerResponse }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <Building2 className="size-4 shrink-0 text-slate-400" />
        <p className="truncate font-medium text-slate-950 dark:text-slate-50">
          {dealer.name}
        </p>
      </div>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
        {dealer.address}
      </p>
    </div>
  );
}

function LocationSummary({ dealer }: { dealer: DealerResponse }) {
  const location = [dealer.province, dealer.district]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <MapPin className="size-4 shrink-0 text-slate-400" />
      <span className="truncate">{location}</span>
    </div>
  );
}

function ContactSummary({ dealer }: { dealer: DealerResponse }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <Phone className="size-4 shrink-0 text-slate-400" />
        <span>{dealer.phone ?? "-"}</span>
      </div>
      {dealer.salesName ? (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <UserRound className="size-4 shrink-0 text-slate-400" />
          <span>{dealer.salesName}</span>
        </div>
      ) : null}
    </div>
  );
}
