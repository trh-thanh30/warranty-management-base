"use client";

import { formatDate, type DealerActivatedCustomerSummary } from "@repo/shared";
import {
  Badge,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

type Props = { items: DealerActivatedCustomerSummary[] };

export function DealerActivatedCustomersTable({ items }: Props) {
  const t = useTranslations("Dealers");

  return (
    <TableScroll className="rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[960px] whitespace-nowrap">
        <TableHeader>
          <TableRow>
            <TableHead>{t("activatedCustomer")}</TableHead>
            <TableHead>{t("activatedProduct")}</TableHead>
            <TableHead>{t("warrantyCode")}</TableHead>
            <TableHead>{t("activatedAt")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("warrantyPeriod")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="max-w-64 truncate font-medium text-slate-950 dark:text-slate-50">
                  {item.customer.fullName}
                </div>
                <div className="mt-1 max-w-64 truncate text-xs text-slate-500 dark:text-slate-400">
                  {item.customer.phone ?? item.customer.email ?? "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-64 truncate font-medium">
                  {item.product.id ? (
                    <Link
                      className="transition-colors hover:text-blue-600 hover:underline"
                      href={`/products/${item.product.id}`}
                    >
                      {item.product.name ?? "-"}
                    </Link>
                  ) : (
                    (item.product.name ?? "-")
                  )}
                </div>
                <div className="mt-1 max-w-64 truncate text-xs text-slate-500 dark:text-slate-400">
                  {[item.product.productCode, item.product.serialNumber]
                    .filter(Boolean)
                    .join(" · ") || "-"}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {item.warranty.warrantyCode || "-"}
              </TableCell>
              <TableCell>{formatDate(item.activatedAt)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.warranty.status === "ACTIVE" ? "success" : "secondary"
                  }
                >
                  {t(`warrantyStatuses.${item.warranty.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  {formatDate(item.warranty.startDate, { showTime: true })} -{" "}
                  {formatDate(item.warranty.endDate, { showTime: true })}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.warranty.durationMonths} {t("monthUnit")}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
