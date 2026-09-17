"use client";

import {
  ArrowLeft,
  ChevronDown,
  FileSearch,
  LoaderCircle,
  Phone,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  formatDate,
  type ContactSubmissionResponse,
  type ContactSubmissionStatus,
} from "@repo/shared";
import {
  getAllowedContactSubmissionTransitions,
  PERMISSIONS,
} from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { EntityQueryState } from "@/src/components/common/entity-query-state";
import { PermissionGuard } from "@/src/components/permission-guard";
import {
  useContactSubmission,
  useUpdateContactSubmissionStatus,
} from "@/src/hooks/use-contact-submissions";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { Link } from "@/src/i18n/navigation";
import { ContactSubmissionStatusBadge } from "./components/contact-submission-status-badge";

type ContactSubmissionDetailViewProps = {
  submissionId: string;
};

export function ContactSubmissionDetailView({
  submissionId,
}: ContactSubmissionDetailViewProps) {
  const t = useTranslations("ContactSubmissions");
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(PERMISSIONS.CONTACT_SUBMISSION_UPDATE);
  const submissionQuery = useContactSubmission(submissionId, {
    enabled: Boolean(submissionId),
  });
  const updateStatus = useUpdateContactSubmissionStatus();

  async function updateSubmissionStatus(
    submission: ContactSubmissionResponse,
    status: ContactSubmissionStatus,
  ) {
    if (submission.status === status) return;

    try {
      await updateStatus.mutateAsync({
        id: submission.id,
        status,
      });
      toast.success(t("toasts.updateSuccess"));
    } catch {
      toast.error(t("toasts.updateError"));
    }
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.CONTACT_SUBMISSION_VIEW]}>
      {submissionQuery.isLoading ? (
        <ContactSubmissionDetailSkeleton />
      ) : submissionQuery.isError || !submissionQuery.data ? (
        <EntityQueryState
          error={submissionQuery.error}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href="/contact-submissions">
                  {t("detail.backToDirectory")}
                </Link>
              </Button>
              <Button
                onClick={() => {
                  void submissionQuery.refetch();
                }}
              >
                {t("detail.tryAgain")}
              </Button>
            </div>
          }
          description={t("detail.loadError")}
          icon={FileSearch}
          title={t("detail.loadErrorTitle")}
        />
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">
          <ContactSubmissionDetailHeader
            canUpdate={canUpdate}
            isUpdating={updateStatus.isPending}
            onUpdateStatus={(status) => {
              void updateSubmissionStatus(submissionQuery.data, status);
            }}
            submission={submissionQuery.data}
          />
          <ContactSubmissionDetailContent submission={submissionQuery.data} />
        </div>
      )}
    </PermissionGuard>
  );
}

function ContactSubmissionDetailHeader({
  canUpdate,
  isUpdating,
  onUpdateStatus,
  submission,
}: {
  canUpdate: boolean;
  isUpdating: boolean;
  onUpdateStatus: (status: ContactSubmissionStatus) => void;
  submission: ContactSubmissionResponse;
}) {
  const t = useTranslations("ContactSubmissions");
  const allowedTransitions = getAllowedContactSubmissionTransitions(
    submission.status,
  );

  return (
    <div className="space-y-4">
      <Button asChild size="sm" variant="ghost">
        <Link className="-ml-3 w-fit" href="/contact-submissions">
          <ArrowLeft className="size-4" />
          {t("detail.backToDirectory")}
        </Link>
      </Button>

      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ContactSubmissionStatusBadge status={submission.status} />
            {canUpdate && allowedTransitions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isUpdating} size="sm" variant="secondary">
                    {isUpdating ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : null}
                    {t("actions.changeStatus")}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allowedTransitions.map((status) => (
                    <DropdownMenuItem
                      disabled={isUpdating}
                      key={status}
                      onSelect={() => onUpdateStatus(status)}
                    >
                      {t("actions.moveTo", {
                        status: t(`statuses.${status}`),
                      })}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        }
        description={t("detail.description")}
        eyebrow={t("eyebrow")}
        title={submission.fullName}
      />
    </div>
  );
}

function ContactSubmissionDetailContent({
  submission,
}: {
  submission: ContactSubmissionResponse;
}) {
  const locale = useLocale();
  const t = useTranslations("ContactSubmissions");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("detail.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableBody>
              <ContactSubmissionDetailRow
                label={t("detail.fullName")}
                value={submission.fullName}
              />
              <ContactSubmissionDetailRow label={t("detail.phone")}>
                <a
                  className="inline-flex min-h-11 items-center gap-2 break-words font-medium text-slate-950 underline-offset-4 hover:text-red-600 hover:underline dark:text-slate-50 dark:hover:text-red-400"
                  href={`tel:${submission.phone}`}
                >
                  <Phone className="size-4 shrink-0" />
                  {submission.phone}
                </a>
              </ContactSubmissionDetailRow>
              <ContactSubmissionDetailRow
                label={t("detail.consultationTopic")}
                value={
                  submission.consultationTopic
                    ? t(`consultationTopics.${submission.consultationTopic}`)
                    : "-"
                }
              />
              <ContactSubmissionDetailRow
                label={t("detail.province")}
                value={submission.provinceName ?? "-"}
              />
              <ContactSubmissionDetailRow
                label={t("detail.createdAt")}
                value={formatDate(submission.createdAt, {
                  dateStyle: "short",
                  locale,
                  showTime: true,
                })}
              />
              <ContactSubmissionDetailRow
                label={t("detail.updatedAt")}
                value={formatDate(submission.updatedAt, {
                  dateStyle: "short",
                  locale,
                  showTime: true,
                })}
              />
              <ContactSubmissionDetailRow label={t("detail.message")}>
                <div className="whitespace-pre-wrap leading-7 text-slate-800 dark:text-slate-100">
                  {submission.content}
                </div>
              </ContactSubmissionDetailRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactSubmissionDetailRow({
  children,
  label,
  value,
}: {
  children?: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <TableRow>
      <TableCell className="w-40 bg-slate-50 text-xs font-medium uppercase text-slate-500 dark:bg-slate-900/70 sm:w-56">
        {label}
      </TableCell>
      <TableCell className="break-words font-medium text-slate-950 dark:text-slate-50">
        {children ?? value}
      </TableCell>
    </TableRow>
  );
}

function ContactSubmissionDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-9 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-5 w-[28rem] max-w-full" />
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
