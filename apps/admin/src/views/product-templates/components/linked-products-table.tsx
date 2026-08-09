"use client";

import { Link } from "@/src/i18n/navigation";
import { formatDate, type ProductResponse } from "@repo/shared";
import {
  Button,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ProductStatusBadge } from "../../products/components/product-status-badge";
import { WarrantyStatusBadge } from "../../products/components/warranty-status-badge";
import { formatProductOwner } from "../../products/products.utils";

export function LinkedProductsTable({
  products,
}: {
  products: ProductResponse[];
}) {
  const t = useTranslations("ProductTemplates");
  const locale = useLocale();

  return (
    <TableScroll className="max-h-144 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-272">
        <TableHeader className="sticky top-0 z-10 bg-white dark:bg-slate-950 [&_th]:h-auto [&_th]:whitespace-normal [&_th]:text-wrap [&_th]:py-2 [&_th]:leading-4">
          <TableRow>
            <TableHead>{t("linkedProduct")}</TableHead>
            <TableHead>{t("productCode")}</TableHead>
            <TableHead>{t("serialNumber")}</TableHead>
            <TableHead>{t("owner")}</TableHead>
            <TableHead>{t("warrantyStatus")}</TableHead>
            <TableHead>{t("productStatus")}</TableHead>
            <TableHead>{t("createdAt")}</TableHead>
            <TableHead aria-label={t("actions")} className="w-14" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="max-w-60">
                  <p className="truncate font-medium text-slate-950 dark:text-slate-50">
                    {product.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {[product.brand, product.model]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {product.productCode}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {product.serialNumber ?? "-"}
              </TableCell>
              <TableCell>{formatProductOwner(product)}</TableCell>
              <TableCell>
                <WarrantyStatusBadge status={product.warranty?.status} />
              </TableCell>
              <TableCell>
                <ProductStatusBadge status={product.status} />
              </TableCell>
              <TableCell>{formatDate(product.createdAt, { locale })}</TableCell>
              <TableCell className="text-right">
                <Button
                  aria-label={t("viewLinkedProduct", {
                    name: product.name,
                  })}
                  asChild
                  size="icon"
                  variant="ghost"
                >
                  <Link href={`/products/${product.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
