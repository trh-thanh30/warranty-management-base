"use client";

import { ArrowUpRight, FileSearch } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type WarrantyClaimPriority,
  type WarrantyClaimSummary,
} from "@repo/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { DashboardWidgetState } from "./dashboard-widget-state";

type DashboardRecentClaimsProps = {
  canView: boolean;
  error: boolean;
  items: WarrantyClaimSummary[];
  loading: boolean;
  onRetry: () => void;
};

export function DashboardRecentClaims({
  canView,
  error,
  items,
  loading,
  onRetry,
}: DashboardRecentClaimsProps) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const statusT = useTranslations("WarrantyClaims.statuses");
  const priorityT = useTranslations("WarrantyClaims.priorities");

  return (
    <Card className="min-w-0 lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t("recentClaims.title")}</CardTitle>
          <CardDescription className="mt-1">
            {t("recentClaims.description")}
          </CardDescription>
        </div>
        {canView ? (
          <Button asChild size="sm" variant="secondary">
            <Link href="/warranty-claims">
              {t("recentClaims.viewAll")}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!canView ? (
          <DashboardWidgetState
            description={t("recentClaims.permissionDescription")}
            title={t("recentClaims.permissionTitle")}
          />
        ) : loading ? (
          <div className="space-y-3 py-3" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-14 w-full" key={index} />
            ))}
          </div>
        ) : error ? (
          <DashboardWidgetState
            description={t("recentClaims.errorDescription")}
            onRetry={onRetry}
            title={t("states.retry")}
          />
        ) : items.length === 0 ? (
          <DashboardWidgetState
            description={t("recentClaims.emptyDescription")}
            title={t("recentClaims.emptyTitle")}
          />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((claim) => (
                <div
                  className="rounded-md border border-slate-200 p-4 dark:border-slate-800"
                  key={claim.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950 dark:text-slate-50">
                        {claim.issueTitle}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {claim.claimCode}
                      </p>
                    </div>
                    <Button
                      asChild
                      aria-label={t("recentClaims.viewClaim")}
                      size="icon"
                      variant="ghost"
                    >
                      <Link href={`/warranty-claims/${claim.id}`}>
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{statusT(claim.status)}</Badge>
                    <Badge variant={getPriorityVariant(claim.priority)}>
                      {priorityT(claim.priority)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(claim.submittedAt, { locale })}
                  </p>
                </div>
              ))}
            </div>

            <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
              <Table className="min-w-[760px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("recentClaims.claim")}</TableHead>
                    <TableHead className="w-[30%]">
                      {t("recentClaims.issue")}
                    </TableHead>
                    <TableHead>{t("recentClaims.status")}</TableHead>
                    <TableHead>{t("recentClaims.priority")}</TableHead>
                    <TableHead>{t("recentClaims.submitted")}</TableHead>
                    <TableHead className="w-20 whitespace-nowrap text-right">
                      {t("recentClaims.action")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">
                        <span className="block max-w-44 truncate">
                          {claim.claimCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-52 truncate font-medium">
                          {claim.issueTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {statusT(claim.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(claim.priority)}>
                          {priorityT(claim.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(claim.submittedAt, { locale })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          aria-label={t("recentClaims.viewClaim")}
                          size="icon"
                          variant="ghost"
                        >
                          <Link href={`/warranty-claims/${claim.id}`}>
                            <FileSearch className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getPriorityVariant(priority: WarrantyClaimPriority) {
  if (priority === "URGENT") return "destructive" as const;
  if (priority === "HIGH") return "warning" as const;

  return "secondary" as const;
}
