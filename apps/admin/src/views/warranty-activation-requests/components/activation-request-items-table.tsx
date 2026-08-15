"use client";

import type { WarrantyActivationRequestItemSummary } from "@repo/shared";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@repo/ui";
import { Download, Eye, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type ActivationRequestItemsTableProps = {
  busyItemId?: string | null;
  items: WarrantyActivationRequestItemSummary[];
  onDownloadCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onResendCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onViewCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
};

export function ActivationRequestItemsTable({
  busyItemId,
  items,
  onDownloadCertificate,
  onResendCertificate,
  onViewCertificate,
}: ActivationRequestItemsTableProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tWarranties = useTranslations("Warranties");

  return (
    <TableScroll className="rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("position")}</TableHead>
            <TableHead>{t("product")}</TableHead>
            <TableHead>{t("productCodeSerial")}</TableHead>
            <TableHead>{t("warrantyCode")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("certificateInfo")}</TableHead>
            {onViewCertificate ||
            onDownloadCertificate ||
            onResendCertificate ? (
              <TableHead className="text-right">{t("actions")}</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.positionLabel}
              </TableCell>
              <TableCell>
                <Link
                  className="font-medium text-blue-700 hover:underline dark:text-blue-400"
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
              <TableCell>
                {item.certificate ? (
                  <div className="space-y-1.5">
                    <p className="font-mono text-xs">
                      {item.certificate.certificateNumber}
                    </p>
                    <Badge variant="secondary">
                      {t(`certificateStatuses.${item.certificate.status}`)}
                    </Badge>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              {onViewCertificate ||
              onDownloadCertificate ||
              onResendCertificate ? (
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {item.certificate && onViewCertificate ? (
                      <Button
                        aria-label={t("viewItemCertificate", {
                          position: item.positionLabel,
                        })}
                        disabled={busyItemId === item.id}
                        onClick={() => onViewCertificate(item)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Eye className="size-4" />
                      </Button>
                    ) : null}
                    {item.certificate && onDownloadCertificate ? (
                      <Button
                        aria-label={t("downloadItemCertificate", {
                          position: item.positionLabel,
                        })}
                        disabled={busyItemId === item.id}
                        onClick={() => onDownloadCertificate(item)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Download className="size-4" />
                      </Button>
                    ) : null}
                    {item.certificate?.recipientEmail &&
                    item.certificate.emailStatus !== "SENT" &&
                    onResendCertificate ? (
                      <Button
                        aria-label={t("resendItemCertificate", {
                          position: item.positionLabel,
                        })}
                        disabled={busyItemId === item.id}
                        onClick={() => onResendCertificate(item)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Send className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
