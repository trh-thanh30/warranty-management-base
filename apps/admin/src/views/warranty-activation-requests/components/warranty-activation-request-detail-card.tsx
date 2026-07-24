"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { WarrantyActivationRequestSummary } from "@repo/shared";
import { Badge, Card, CardContent, Skeleton } from "@repo/ui";
import {
  formatActivationRequestAddress,
  formatActivationRequestDate,
} from "../warranty-activation-requests.utils";
import { WarrantyActivationRequestStatusBadge } from "./warranty-activation-request-status-badge";

type WarrantyActivationRequestDetailCardProps = {
  request: WarrantyActivationRequestSummary;
};

export function WarrantyActivationRequestDetailCard({
  request,
}: WarrantyActivationRequestDetailCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tWarranties = useTranslations("Warranties");
  const activatedWarranty = request.activatedWarranty;
  const certificate = request.certificate;

  return (
    <Card className="min-w-0">
      <CardContent className="space-y-7 px-4 py-6 sm:px-6">
        <DetailSection title={t("requestInfo")}>
          <DetailItem label={t("requestCode")} value={request.requestCode} />
          <DetailItem label={t("warrantyCode")} value={request.warrantyCode} />
          <DetailItem
            label={t("source")}
            value={t(`sources.${request.source}`)}
          />
          <DetailItem
            label={t("createdBy")}
            value={formatUserSummary(request.createdBy)}
          />
          <div className="min-w-0 space-y-1.5">
            <dt className={detailLabelClassName}>{t("status")}</dt>
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
          <DetailItem
            label={t("resolvedCustomer")}
            value={
              request.customer
                ? `${request.customer.fullName} (${request.customer.customerCode})`
                : "-"
            }
          />
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
          <DetailItem label={t("product")} value={request.productName ?? "-"} />
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
            value={formatUserSummary(request.reviewedBy)}
          />
          <DetailItem
            label={t("activatedWarranty")}
            value={
              activatedWarranty ? (
                <Link
                  className="font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-blue-400"
                  href={`/warranties/${activatedWarranty.id}`}
                >
                  {activatedWarranty.warrantyCode}
                </Link>
              ) : (
                "-"
              )
            }
          />
          <DetailItem
            label={t("activatedWarrantyStatus")}
            value={
              activatedWarranty ? (
                <Badge variant="secondary">
                  {tWarranties(`statuses.${activatedWarranty.status}`)}
                </Badge>
              ) : (
                "-"
              )
            }
          />
          <DetailItem
            label={t("activatedWarrantyPeriod")}
            value={
              activatedWarranty
                ? t("activatedWarrantyPeriodValue", {
                    duration: activatedWarranty.durationMonths,
                    endDate: formatActivationRequestDate(
                      activatedWarranty.endDate,
                    ),
                    startDate: formatActivationRequestDate(
                      activatedWarranty.startDate,
                    ),
                  })
                : "-"
            }
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

        <DetailSection title={t("certificateInfo")}>
          <DetailItem
            label={t("certificateNumber")}
            value={certificate?.certificateNumber ?? "-"}
          />
          <DetailItem
            label={t("certificateEmail")}
            value={
              certificate
                ? (certificate.recipientEmail ?? t("certificateNoEmail"))
                : "-"
            }
          />
          <DetailItem
            label={t("certificateStatus")}
            value={
              certificate ? (
                <Badge variant="secondary">
                  {t(`certificateStatuses.${certificate.status}`)}
                </Badge>
              ) : (
                "-"
              )
            }
          />
          <DetailItem
            label={t("certificateEmailStatus")}
            value={
              certificate ? (
                <Badge variant="secondary">
                  {certificate.recipientEmail
                    ? t(`certificateEmailStatuses.${certificate.emailStatus}`)
                    : t("certificateNoEmail")}
                </Badge>
              ) : (
                "-"
              )
            }
          />
          <DetailItem
            label={t("certificateGeneratedAt")}
            value={formatActivationRequestDate(
              certificate?.generatedAt ?? null,
            )}
          />
          <DetailItem
            label={t("certificateEmailedAt")}
            value={formatActivationRequestDate(certificate?.emailedAt ?? null)}
          />
          <DetailItem
            className="sm:col-span-2"
            label={t("certificateLastError")}
            value={certificate?.lastError ?? "-"}
          />
        </DetailSection>
      </CardContent>
    </Card>
  );
}

function formatUserSummary(
  user: {
    displayName: string;
    email: string;
  } | null,
) {
  return user ? `${user.displayName} (${user.email})` : "-";
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
      <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {title}
      </h2>
      <dl className="grid gap-x-8 gap-y-5 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800">
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
  value: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className={detailLabelClassName}>{label}</dt>
      <dd className="mt-1.5 break-words text-sm leading-6 text-slate-950 dark:text-slate-50">
        {value || "-"}
      </dd>
    </div>
  );
}

const detailLabelClassName =
  "text-xs font-medium uppercase text-slate-500 dark:text-slate-400";

export function WarrantyActivationRequestDetailSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-7 px-4 py-6 sm:px-6">
        {Array.from({ length: 4 }, (_, sectionIndex) => (
          <div className="space-y-4" key={sectionIndex}>
            <Skeleton className="h-5 w-44" />
            <div className="grid gap-5 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800">
              {Array.from(
                { length: sectionIndex === 1 ? 5 : 4 },
                (_, index) => (
                  <div className="space-y-2" key={index}>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-full max-w-xs" />
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
