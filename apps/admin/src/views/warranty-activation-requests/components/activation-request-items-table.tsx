"use client";

import type { WarrantyActivationRequestItemSummary } from "@repo/shared";
import {
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
  TableScroll,
} from "@repo/ui";
import { Download, Eye, MoreHorizontal, RotateCcw, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type ActivationRequestItemsTableProps = {
  busyItemId?: string | null;
  items: WarrantyActivationRequestItemSummary[];
  onDownloadCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onResendCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onRetryCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onViewCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
};

export function ActivationRequestItemsTable({
  busyItemId,
  items,
  onDownloadCertificate,
  onResendCertificate,
  onRetryCertificate,
  onViewCertificate,
}: ActivationRequestItemsTableProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tWarranties = useTranslations("Warranties");

  return (
    <TableScroll className="max-w-full overscroll-x-contain rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[1120px] whitespace-nowrap">
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
            onResendCertificate ||
            onRetryCertificate ? (
              <TableHead className="text-right">{t("actions")}</TableHead>
            ) : null}
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
              onResendCertificate ||
              onRetryCertificate ? (
                <TableCell className="text-right">
                  <ActivationRequestItemActions
                    busy={busyItemId === item.id}
                    item={item}
                    onDownloadCertificate={onDownloadCertificate}
                    onResendCertificate={onResendCertificate}
                    onRetryCertificate={onRetryCertificate}
                    onViewCertificate={onViewCertificate}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}

function ActivationRequestItemActions({
  busy,
  item,
  onDownloadCertificate,
  onResendCertificate,
  onRetryCertificate,
  onViewCertificate,
}: {
  busy: boolean;
  item: WarrantyActivationRequestItemSummary;
  onDownloadCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onResendCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onRetryCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
  onViewCertificate?: (item: WarrantyActivationRequestItemSummary) => void;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const hasGeneratedCertificate =
    item.certificate?.status === "GENERATED" &&
    Boolean(item.certificate.storageKey);
  const canView = hasGeneratedCertificate && Boolean(onViewCertificate);
  const canDownload = hasGeneratedCertificate && Boolean(onDownloadCertificate);
  const canResend = Boolean(
    item.certificate?.status === "GENERATED" &&
    item.certificate.recipientEmail &&
    item.certificate.emailStatus !== "SENT" &&
    onResendCertificate,
  );
  const canRetry = Boolean(
    item.status === "ACTIVATED" &&
    (!item.certificate ||
      item.certificate.status !== "GENERATED" ||
      !item.certificate.storageKey) &&
    onRetryCertificate,
  );

  if (!canView && !canDownload && !canResend && !canRetry) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openItemActions", { position: item.positionLabel })}
          disabled={busy}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {canView ? (
          <DropdownMenuItem onSelect={() => onViewCertificate?.(item)}>
            <Eye aria-hidden="true" className="mr-2 size-4" />
            {t("viewCertificate")}
          </DropdownMenuItem>
        ) : null}
        {canDownload ? (
          <DropdownMenuItem onSelect={() => onDownloadCertificate?.(item)}>
            <Download aria-hidden="true" className="mr-2 size-4" />
            {t("downloadCertificate")}
          </DropdownMenuItem>
        ) : null}
        {canResend ? (
          <DropdownMenuItem onSelect={() => onResendCertificate?.(item)}>
            <Send aria-hidden="true" className="mr-2 size-4" />
            {t("resendCertificateEmail")}
          </DropdownMenuItem>
        ) : null}
        {canRetry ? (
          <DropdownMenuItem onSelect={() => onRetryCertificate?.(item)}>
            <RotateCcw aria-hidden="true" className="mr-2 size-4" />
            {t("retryCertificate")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
