"use client";

import { useTranslations } from "next-intl";
import type { WarrantyActivationRequestSummary } from "@repo/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import {
  formatActivationRequestAddress,
  formatActivationRequestDate,
} from "../warranty-activation-requests.utils";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type WarrantyActivationRequestDetailDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  request: WarrantyActivationRequestSummary | null;
};

export function WarrantyActivationRequestDetailDialog({
  onOpenChange,
  open,
  request,
}: WarrantyActivationRequestDetailDialogProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),56rem)] max-w-none overflow-y-auto p-5 sm:p-6">
        <DialogTitle className="text-lg font-semibold">
          {request?.requestCode ?? t("detailTitle")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("detailDescription")}
        </DialogDescription>

        {request ? (
          <div className="mt-6 space-y-6">
            <DetailSection title={t("requestInfo")}>
              <DetailItem
                label={t("requestCode")}
                value={request.requestCode}
              />
              <DetailItem
                label={t("warrantyCode")}
                value={request.warrantyCode}
              />
              <div className="min-w-0 space-y-1.5">
                <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  {t("status")}
                </dt>
                <dd>
                  <WarrantyActivationRequestStatusBadge
                    label={t(`statuses.${request.status}`)}
                    status={request.status}
                  />
                </dd>
              </div>
              <DetailItem
                label={t("createdAt")}
                value={formatActivationRequestDate(request.createdAt)}
              />
            </DetailSection>

            <DetailSection title={t("customerInfo")}>
              <DetailItem label={t("customer")} value={request.customerName} />
              <DetailItem label={t("phone")} value={request.customerPhone} />
              <DetailItem label={t("email")} value={request.customerEmail} />
              <DetailItem
                label={t("birthdate")}
                value={request.customerBirthdate ?? "-"}
              />
              <DetailItem
                className="sm:col-span-2"
                label={t("address")}
                value={formatActivationRequestAddress(request)}
              />
            </DetailSection>

            <DetailSection title={t("productInfo")}>
              <DetailItem
                label={t("product")}
                value={request.productName ?? "-"}
              />
              <DetailItem
                label={t("serialNumber")}
                value={request.serialNumber ?? "-"}
              />
              <DetailItem label={t("brand")} value={request.brand ?? "-"} />
              <DetailItem label={t("model")} value={request.model ?? "-"} />
              <DetailItem
                label={t("manufactureYear")}
                value={request.manufactureYear?.toString() ?? "-"}
              />
              <DetailItem
                className="sm:col-span-2"
                label={t("note")}
                value={request.note ?? "-"}
              />
            </DetailSection>

            <DetailSection title={t("reviewInfo")}>
              <DetailItem
                label={t("reviewedAt")}
                value={formatActivationRequestDate(request.reviewedAt)}
              />
              <DetailItem
                label={t("reviewedBy")}
                value={request.reviewedById ?? "-"}
              />
              <DetailItem
                label={t("activatedWarrantyId")}
                value={request.activatedWarrantyId ?? "-"}
              />
              <DetailItem
                className="sm:col-span-2"
                label={t("adminNote")}
                value={request.adminNote ?? "-"}
              />
              <DetailItem
                className="sm:col-span-2"
                label={t("rejectionReason")}
                value={request.rejectionReason ?? "-"}
              />
            </DetailSection>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {title}
      </h3>
      <dl className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800">
        {children}
      </dl>
    </section>
  );
}

function DetailItem({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-slate-950 dark:text-slate-50">
        {value || "-"}
      </dd>
    </div>
  );
}
