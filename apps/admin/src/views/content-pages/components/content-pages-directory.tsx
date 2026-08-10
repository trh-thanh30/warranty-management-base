"use client";

import {
  Archive,
  FileText,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type ContentPageSortBy,
  type ContentPageStatus,
  type ContentPageSummary,
  type PaginatedResponse,
} from "@repo/shared";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import {
  CONTENT_PAGE_KINDS,
  CONTENT_PAGE_STATUSES,
} from "../content-pages.constants";
import type {
  ContentPageKindFilter,
  ContentPageStatusFilter,
} from "../content-pages.types";
import { ContentPageStatusBadge } from "./content-page-status-badge";

type Props = {
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  data?: PaginatedResponse<ContentPageSummary>;
  isError: boolean;
  isLoading: boolean;
  kind: ContentPageKindFilter;
  status: ContentPageStatusFilter;
  search: string;
  pageSize: number;
  sortBy?: ContentPageSortBy;
  sortOrder: "asc" | "desc";
  onClear: () => void;
  onDelete: (page: ContentPageSummary) => void;
  onStatusUpdate: (page: ContentPageSummary, status: ContentPageStatus) => void;
  onKindChange: (value: ContentPageKindFilter) => void;
  onStatusChange: (value: ContentPageStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onSortChange: (sort: ContentPageSortBy) => void;
};

export function ContentPagesDirectory(props: Props) {
  const t = useTranslations("ContentPages");
  const hasFilters =
    Boolean(props.search.trim()) ||
    props.kind !== "ALL" ||
    props.status !== "ALL";
  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              aria-label={t("searchLabel")}
              className="h-11 pl-9 sm:h-10"
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              value={props.search}
            />
          </div>
          <SelectControl
            aria-label={t("kindFilter")}
            onValueChange={(value) =>
              props.onKindChange(value as ContentPageKindFilter)
            }
            options={[
              { label: t("allKinds"), value: "ALL" },
              ...CONTENT_PAGE_KINDS.map((kind) => ({
                label: t(`kinds.${kind}`),
                value: kind,
              })),
            ]}
            triggerClassName="h-11 text-base sm:h-10 sm:text-sm"
            value={props.kind}
          />
          <SelectControl
            aria-label={t("statusFilter")}
            onValueChange={(value) =>
              props.onStatusChange(value as ContentPageStatusFilter)
            }
            options={[
              { label: t("allStatuses"), value: "ALL" },
              ...CONTENT_PAGE_STATUSES.map((status) => ({
                label: t(`statuses.${status}`),
                value: status,
              })),
            ]}
            triggerClassName="h-11 text-base sm:h-10 sm:text-sm"
            value={props.status}
          />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {props.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton className="h-16 w-full" key={i} />
            ))}
          </div>
        ) : props.isError ? (
          <StatePanel
            action={
              <Button onClick={props.onRetry} variant="secondary">
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FileText}
            title={t("loadErrorTitle")}
          />
        ) : props.data?.items.length ? (
          <DirectoryResults {...props} data={props.data} />
        ) : (
          <StatePanel
            action={
              hasFilters ? (
                <Button onClick={props.onClear} variant="secondary">
                  {t("clearFilters")}
                </Button>
              ) : props.canCreate ? (
                <Button asChild>
                  <Link href="/content-pages/create">{t("create")}</Link>
                </Button>
              ) : null
            }
            description={
              hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
            }
            icon={FileText}
            title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
          />
        )}
      </CardContent>
    </Card>
  );
}

function DirectoryResults(
  props: Props & { data: PaginatedResponse<ContentPageSummary> },
) {
  const t = useTranslations("ContentPages");
  const locale = useLocale();
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {props.data.items.map((page) => (
          <article
            className="rounded-md border border-slate-200 p-4 dark:border-slate-800"
            key={page.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{page.title}</p>
                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                  /{page.slug}
                </p>
              </div>
              <Actions {...props} page={page} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ContentPageStatusBadge status={page.status} />
              <span className="text-xs text-slate-500">
                {t(`kinds.${page.kind}`)}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {t("updatedAt")}:{" "}
              {formatDate(page.updatedAt, { locale, showTime: true })}
            </p>
          </article>
        ))}
      </div>
      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={props.sortBy}
                onSortChange={props.onSortChange}
                sortBy="title"
                sortOrder={props.sortOrder}
              >
                {t("titleLabel")}
              </SortableTableHead>
              <TableHead>{t("kindLabel")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <SortableTableHead
                activeSortBy={props.sortBy}
                onSortChange={props.onSortChange}
                sortBy="updatedAt"
                sortOrder={props.sortOrder}
              >
                {t("updatedAt")}
              </SortableTableHead>
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.data.items.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <p className="max-w-sm truncate font-medium">{page.title}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    /{page.slug}
                  </p>
                </TableCell>
                <TableCell>{t(`kinds.${page.kind}`)}</TableCell>
                <TableCell>
                  <ContentPageStatusBadge status={page.status} />
                </TableCell>
                <TableCell>
                  {formatDate(page.updatedAt, { locale, showTime: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Actions {...props} page={page} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
      <PaginationControls
        nextLabel={t("next")}
        onPageChange={props.onPageChange}
        onPageSizeChange={props.onPageSizeChange}
        page={props.data.meta.page}
        pageSize={props.pageSize}
        pageSizeLabel={t("pageSize")}
        previousLabel={t("previous")}
        summary={t("pagination", {
          page: props.data.meta.page,
          total: props.data.meta.total,
          totalPages: Math.max(props.data.meta.totalPages, 1),
        })}
        totalPages={props.data.meta.totalPages}
      />
    </>
  );
}

function Actions({
  canDelete,
  canEdit,
  onDelete,
  onStatusUpdate,
  page,
}: Pick<Props, "canDelete" | "canEdit" | "onDelete" | "onStatusUpdate"> & {
  page: ContentPageSummary;
}) {
  const t = useTranslations("ContentPages");
  if (!canEdit && !canDelete) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { title: page.title })}
          className="size-11 sm:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/content-pages/${page.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canEdit ? (
          <>
            <DropdownMenuSeparator />
            {getStatusActions(page.status).map((action) => (
              <DropdownMenuItem
                key={action.status}
                onSelect={() => onStatusUpdate(page, action.status)}
              >
                <action.icon className="mr-2 size-4" />
                {t(action.labelKey)}
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
        {canDelete ? (
          <>
            {canEdit ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              className="text-red-600"
              onSelect={() => onDelete(page)}
            >
              <Trash2 className="mr-2 size-4" />
              {t("delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getStatusActions(status: ContentPageStatus): Array<{
  icon: typeof Send;
  labelKey: "publish" | "moveToDraft" | "archive";
  status: ContentPageStatus;
}> {
  if (status === "DRAFT") {
    return [
      { icon: Send, labelKey: "publish", status: "PUBLISHED" },
      { icon: Archive, labelKey: "archive", status: "ARCHIVED" },
    ];
  }

  if (status === "PUBLISHED") {
    return [
      { icon: RotateCcw, labelKey: "moveToDraft", status: "DRAFT" },
      { icon: Archive, labelKey: "archive", status: "ARCHIVED" },
    ];
  }

  return [
    { icon: RotateCcw, labelKey: "moveToDraft", status: "DRAFT" },
    { icon: Send, labelKey: "publish", status: "PUBLISHED" },
  ];
}
