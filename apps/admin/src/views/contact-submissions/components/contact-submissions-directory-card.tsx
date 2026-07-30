"use client";

import {
  Archive,
  CircleCheck,
  CircleDot,
  Clock3,
  Eye,
  Inbox,
  LoaderCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type {
  ContactSubmissionResponse,
  ContactSubmissionStatus,
  ListContactSubmissionsResponse,
} from "@repo/shared";
import { getAllowedContactSubmissionTransitions } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import {
  CONTACT_SUBMISSION_STATUS_FILTERS,
  type ContactSubmissionStatusFilter,
} from "../contact-submissions.constants";
import { formatContactSubmissionCreatedAt } from "../contact-submissions.utils";
import { Link } from "@/src/i18n/navigation";
import { ContactSubmissionStatusBadge } from "./contact-submission-status-badge";

type ContactSubmissionsDirectoryCardProps = {
  canUpdate: boolean;
  data?: ListContactSubmissionsResponse;
  isError: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: ContactSubmissionStatusFilter) => void;
  onUpdateStatus: (
    submission: ContactSubmissionResponse,
    status: ContactSubmissionStatus,
  ) => void;
  pageSize: number;
  search: string;
  status: ContactSubmissionStatusFilter;
};

export function ContactSubmissionsDirectoryCard(
  props: ContactSubmissionsDirectoryCardProps,
) {
  const t = useTranslations("ContactSubmissions");
  const hasFilters = Boolean(props.search.trim()) || props.status !== "ALL";

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>{t("directory.title")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directory.description")}
          </CardDescription>
        </div>
        <DirectoryFilters {...props} />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <DirectoryContent {...props} hasFilters={hasFilters} />
      </CardContent>
    </Card>
  );
}

function DirectoryFilters({
  onSearchChange,
  onStatusChange,
  search,
  status,
}: ContactSubmissionsDirectoryCardProps) {
  const t = useTranslations("ContactSubmissions");

  return (
    <div className="grid w-full gap-3 sm:grid-cols-[1fr_13rem] lg:w-[34rem]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label={t("directory.searchLabel")}
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("directory.searchPlaceholder")}
          value={search}
        />
      </div>
      <SelectControl
        aria-label={t("directory.statusFilterLabel")}
        onValueChange={(value) =>
          onStatusChange(value as ContactSubmissionStatusFilter)
        }
        options={CONTACT_SUBMISSION_STATUS_FILTERS.map((statusFilter) => ({
          label:
            statusFilter === "ALL"
              ? t("filters.ALL")
              : t(`statuses.${statusFilter}`),
          value: statusFilter,
        }))}
        value={status}
      />
    </div>
  );
}

function DirectoryContent({
  canUpdate,
  data,
  hasFilters,
  isError,
  isLoading,
  isUpdating,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onUpdateStatus,
  pageSize,
}: ContactSubmissionsDirectoryCardProps & { hasFilters: boolean }) {
  const t = useTranslations("ContactSubmissions");

  if (isLoading) return <DirectorySkeleton />;

  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} variant="secondary">
            {t("directory.retry")}
          </Button>
        }
        description={t("directory.loadErrorDescription")}
        icon={Inbox}
        title={t("directory.loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <ContactSubmissionsList
          canUpdate={canUpdate}
          isUpdating={isUpdating}
          items={data.items}
          onUpdateStatus={onUpdateStatus}
        />
        <PaginationControls
          nextLabel={t("directory.next")}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          page={data.meta.page}
          pageSize={pageSize}
          pageSizeLabel={t("directory.pageSize")}
          previousLabel={t("directory.previous")}
          summary={t("directory.pagination", {
            page: data.meta.page,
            total: data.meta.total,
            totalPages: Math.max(data.meta.totalPages, 1),
          })}
          totalPages={data.meta.totalPages}
        />
      </>
    );
  }

  return (
    <StatePanel
      action={
        hasFilters ? (
          <Button onClick={onClearFilters} variant="secondary">
            {t("directory.clearFilters")}
          </Button>
        ) : null
      }
      description={
        hasFilters
          ? t("directory.noResultsDescription")
          : t("directory.emptyDescription")
      }
      icon={Inbox}
      title={
        hasFilters ? t("directory.noResultsTitle") : t("directory.emptyTitle")
      }
    />
  );
}

function ContactSubmissionsList({
  canUpdate,
  isUpdating,
  items,
  onUpdateStatus,
}: {
  canUpdate: boolean;
  isUpdating: boolean;
  items: ContactSubmissionResponse[];
  onUpdateStatus: ContactSubmissionsDirectoryCardProps["onUpdateStatus"];
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((submission) => (
          <ContactSubmissionMobileCard
            canUpdate={canUpdate}
            isUpdating={isUpdating}
            key={submission.id}
            onUpdateStatus={onUpdateStatus}
            submission={submission}
          />
        ))}
      </div>

      <DesktopContactSubmissionsTable
        canUpdate={canUpdate}
        isUpdating={isUpdating}
        items={items}
        onUpdateStatus={onUpdateStatus}
      />
    </>
  );
}

function DesktopContactSubmissionsTable({
  canUpdate,
  isUpdating,
  items,
  onUpdateStatus,
}: {
  canUpdate: boolean;
  isUpdating: boolean;
  items: ContactSubmissionResponse[];
  onUpdateStatus: ContactSubmissionsDirectoryCardProps["onUpdateStatus"];
}) {
  const t = useTranslations("ContactSubmissions");

  return (
    <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800 md:block">
      <Table className="min-w-[72rem]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("directory.customer")}</TableHead>
            <TableHead>{t("directory.consultationTopic")}</TableHead>
            <TableHead>{t("directory.province")}</TableHead>
            <TableHead>{t("directory.content")}</TableHead>
            <TableHead>{t("directory.status")}</TableHead>
            <TableHead>{t("directory.createdAt")}</TableHead>
            <TableHead aria-label={t("directory.actionsLabel")} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((submission) => (
            <ContactSubmissionTableRow
              canUpdate={canUpdate}
              isUpdating={isUpdating}
              key={submission.id}
              onUpdateStatus={onUpdateStatus}
              submission={submission}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ContactSubmissionTableRow({
  canUpdate,
  isUpdating,
  onUpdateStatus,
  submission,
}: {
  canUpdate: boolean;
  isUpdating: boolean;
  onUpdateStatus: ContactSubmissionsDirectoryCardProps["onUpdateStatus"];
  submission: ContactSubmissionResponse;
}) {
  const locale = useLocale();
  const t = useTranslations("ContactSubmissions");

  return (
    <TableRow>
      <TableCell>
        <ContactIdentity submission={submission} />
      </TableCell>
      <TableCell className="max-w-44">
        <span className="line-clamp-2">
          {submission.consultationTopic
            ? t(`consultationTopics.${submission.consultationTopic}`)
            : "-"}
        </span>
      </TableCell>
      <TableCell className="max-w-44">
        <span className="line-clamp-2">{submission.provinceName ?? "-"}</span>
      </TableCell>
      <TableCell className="max-w-sm">
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {submission.content}
        </p>
      </TableCell>
      <TableCell>
        <ContactSubmissionStatusBadge status={submission.status} />
      </TableCell>
      <TableCell>
        {formatContactSubmissionCreatedAt(submission.createdAt, locale)}
      </TableCell>
      <TableCell className="text-right">
        <RowActions
          canUpdate={canUpdate}
          isUpdating={isUpdating}
          onUpdateStatus={(status) => onUpdateStatus(submission, status)}
          submission={submission}
        />
      </TableCell>
    </TableRow>
  );
}

function ContactSubmissionMobileCard({
  canUpdate,
  isUpdating,
  onUpdateStatus,
  submission,
}: {
  canUpdate: boolean;
  isUpdating: boolean;
  onUpdateStatus: ContactSubmissionsDirectoryCardProps["onUpdateStatus"];
  submission: ContactSubmissionResponse;
}) {
  const locale = useLocale();
  const t = useTranslations("ContactSubmissions");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <ContactIdentity submission={submission} />
        <div className="flex items-start gap-2">
          <ContactSubmissionStatusBadge status={submission.status} />
          <RowActions
            canUpdate={canUpdate}
            isUpdating={isUpdating}
            onUpdateStatus={(status) => onUpdateStatus(submission, status)}
            submission={submission}
          />
        </div>
      </div>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-slate-500">{t("directory.consultationTopic")}</dt>
          <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
            {submission.consultationTopic
              ? t(`consultationTopics.${submission.consultationTopic}`)
              : "-"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-slate-500">{t("directory.province")}</dt>
          <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
            {submission.provinceName ?? "-"}
          </dd>
        </div>
      </dl>
      <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
        {submission.content}
      </p>
      <p className="mt-4 text-xs text-slate-500">
        {formatContactSubmissionCreatedAt(submission.createdAt, locale)}
      </p>
    </article>
  );
}

function ContactIdentity({
  submission,
}: {
  submission: ContactSubmissionResponse;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-slate-950 dark:text-slate-50">
        {submission.fullName}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {submission.phone}
      </p>
    </div>
  );
}

function RowActions({
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("directory.openActions")}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/contact-submissions/${submission.id}`}>
            <Eye className="mr-2 size-4" />
            {t("directory.viewDetail")}
          </Link>
        </DropdownMenuItem>
        {canUpdate && allowedTransitions.length > 0 ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {isUpdating ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              {t("actions.changeStatus")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {allowedTransitions.map((status) => (
                <DropdownMenuItem
                  disabled={isUpdating}
                  key={status}
                  onSelect={() => onUpdateStatus(status)}
                >
                  <ContactSubmissionStatusIcon status={status} />
                  {t(`statuses.${status}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const CONTACT_SUBMISSION_STATUS_ICONS = {
  ARCHIVED: Archive,
  IN_PROGRESS: Clock3,
  NEW: CircleDot,
  RESOLVED: CircleCheck,
} satisfies Record<ContactSubmissionStatus, LucideIcon>;

function ContactSubmissionStatusIcon({
  status,
}: {
  status: ContactSubmissionStatus;
}) {
  const Icon = CONTACT_SUBMISSION_STATUS_ICONS[status];

  return <Icon className="mr-2 size-4" />;
}

function DirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}
