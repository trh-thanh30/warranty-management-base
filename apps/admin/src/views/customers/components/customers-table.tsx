"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Avatar,
  AvatarFallback,
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
import { usePermissions } from "@/src/hooks/use-permissions";
import { getInitials } from "@/src/utils/get-initials";
import {
  formatCustomerCreatedAt,
  getCustomerContact,
  getCustomerDisplayName,
} from "../customers.utils";

type CustomersTableProps = {
  items: CustomerSummary[];
  onEdit: (customer: CustomerSummary) => void;
};

export function CustomersTable({ items, onEdit }: CustomersTableProps) {
  const t = useTranslations("Customers");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((customer) => (
          <CustomerMobileCard
            customer={customer}
            key={customer.id}
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("phone")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("account")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((customer) => (
              <CustomerTableRow
                customer={customer}
                key={customer.id}
                onEdit={onEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function CustomerTableRow({
  customer,
  onEdit,
}: {
  customer: CustomerSummary;
  onEdit: CustomersTableProps["onEdit"];
}) {
  return (
    <TableRow>
      <TableCell>
        <CustomerIdentityCell customer={customer} />
      </TableCell>
      <TableCell>{customer.phone || "-"}</TableCell>
      <TableCell>{customer.email || "-"}</TableCell>
      <TableCell>
        <CustomerAccountBadge customer={customer} />
      </TableCell>
      <TableCell>{formatCustomerCreatedAt(customer.createdAt)}</TableCell>
      <TableCell className="text-right">
        <CustomerActionsMenu customer={customer} onEdit={onEdit} />
      </TableCell>
    </TableRow>
  );
}

function CustomerIdentityCell({ customer }: { customer: CustomerSummary }) {
  const displayName = getCustomerDisplayName(customer);
  const contact = getCustomerContact(customer);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
          {customer.customerCode}
          {contact ? ` - ${contact}` : ""}
        </p>
      </div>
    </div>
  );
}

function CustomerMobileCard({
  customer,
  onEdit,
}: {
  customer: CustomerSummary;
  onEdit: CustomersTableProps["onEdit"];
}) {
  const t = useTranslations("Customers");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <CustomerIdentityCell customer={customer} />
        <CustomerActionsMenu customer={customer} onEdit={onEdit} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CustomerMobileField label={t("phone")} value={customer.phone || "-"} />
        <CustomerMobileField label={t("email")} value={customer.email || "-"} />
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("account")}
          </dt>
          <dd className="mt-1">
            <CustomerAccountBadge customer={customer} />
          </dd>
        </div>
        <CustomerMobileField
          label={t("createdAt")}
          value={formatCustomerCreatedAt(customer.createdAt)}
        />
      </dl>
      {customer.address ? (
        <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {customer.address}
        </p>
      ) : null}
    </article>
  );
}

function CustomerMobileField({
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

function CustomerAccountBadge({ customer }: { customer: CustomerSummary }) {
  const t = useTranslations("Customers");

  return (
    <Badge variant={customer.userId ? "success" : "secondary"}>
      {customer.userId ? t("linkedAccount") : t("profileOnly")}
    </Badge>
  );
}

function CustomerActionsMenu({
  customer,
  onEdit,
}: {
  customer: CustomerSummary;
  onEdit: CustomersTableProps["onEdit"];
}) {
  const t = useTranslations("Customers");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.CUSTOMER_UPDATE);
  const displayName = getCustomerDisplayName(customer);

  if (!canEdit) {
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
        <DropdownMenuItem onSelect={() => onEdit(customer)}>
          <Pencil className="mr-2 size-4" />
          {t("edit")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
