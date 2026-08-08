"use client";

import { formatDate, type DealerActivatedCustomerSummary } from "@repo/shared";
import {
  Badge,
  Table,
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
    <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[820px]">
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
                <div className="font-medium text-slate-950 dark:text-slate-50">
                  {item.customer.fullName}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.customer.phone ?? item.customer.email ?? "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
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
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                  {formatDate(item.warranty.startDate)} -{" "}
                  {formatDate(item.warranty.endDate)}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.warranty.durationMonths} {t("monthUnit")}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
