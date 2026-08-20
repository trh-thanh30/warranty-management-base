"use client";

import type { WarrantyActivationRequestItemSummary } from "@repo/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type ActivationRequestItemsTableProps = {
  items: WarrantyActivationRequestItemSummary[];
};

export function ActivationRequestItemsTable({
  items,
}: ActivationRequestItemsTableProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tWarranties = useTranslations("Warranties");

  return (
    <TableScroll className="max-w-full overscroll-x-contain rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[920px] whitespace-nowrap">
        <TableHeader>
          <TableRow>
            <TableHead>{t("position")}</TableHead>
            <TableHead>{t("product")}</TableHead>
            <TableHead>{t("productCodeSerial")}</TableHead>
            <TableHead>{t("warrantyCode")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <span className="block max-w-52 truncate">
                  {item.positionLabel}
                </span>
              </TableCell>
              <TableCell>
                <Link
                  className="block max-w-64 truncate font-medium text-blue-700 hover:underline dark:text-blue-400"
                  href={`/products/${item.productId}`}
                >
                  {item.productName}
                </Link>
              </TableCell>
              <TableCell>
                <p className="font-mono text-xs">{item.productCode}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {item.serialNumber ?? "-"}
                </p>
              </TableCell>
              <TableCell>
                <Link
                  className="font-mono text-xs text-blue-700 hover:underline dark:text-blue-400"
                  href={`/warranties/${item.warrantyId}`}
                >
                  {item.warrantyCode}
                </Link>
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <WarrantyActivationRequestStatusBadge
                    label={t(`statuses.${item.status}`)}
                    status={item.status}
                  />
                  <p className="text-xs text-slate-500">
                    {tWarranties(`statuses.${item.warrantyStatus}`)}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
