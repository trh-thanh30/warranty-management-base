import {
  AlertTriangle,
  CheckCircle2,
  Download,
  KeyRound,
  Layers3,
  LoaderCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ActivationCodeReport } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
} from "@repo/ui";
import { formatDashboardNumber } from "../dashboard.utils";
import { DashboardWidgetState } from "./dashboard-widget-state";
import type { ActivationCodeReportQuery } from "../hooks/use-dashboard-activation-codes";
import { useDashboardActivationCodeReportExport } from "../hooks/use-dashboard-activation-codes";

type Props = {
  data?: ActivationCodeReport;
  error: boolean;
  filters: ActivationCodeReportQuery;
  loading: boolean;
  onRetry: () => void;
};

export function DashboardActivationCodeOperations({
  data,
  error,
  filters,
  loading,
  onRetry,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.activationCodes");
  const exportMutation = useDashboardActivationCodeReportExport(filters);

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-5 w-56" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-20" key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <DashboardWidgetState
          description={t("errorDescription")}
          onRetry={onRetry}
          title={t("retry")}
        />
      </Card>
    );
  }

  const metrics = [
    { icon: Layers3, key: "total", value: data.total, variant: "default" },
    {
      icon: KeyRound,
      key: "available",
      value: data.byStatus.AVAILABLE ?? 0,
      variant: "info",
    },
    {
      icon: CheckCircle2,
      key: "activated",
      value: data.byStatus.ACTIVATED ?? 0,
      variant: "success",
    },
    {
      icon: AlertTriangle,
      key: "expired",
      value: data.byStatus.EXPIRED ?? 0,
      variant: "warning",
    },
  ] as const;
  const iconClasses = {
    default: "text-slate-600 dark:text-slate-400",
    info: "text-blue-600 dark:text-blue-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
  } as const;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("description")}
          </CardDescription>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
          size="sm"
          variant="outline"
        >
          {exportMutation.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          {exportMutation.isPending ? t("exporting") : t("export")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ icon: Icon, key, value, variant }) => (
            <div
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              key={key}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(`metrics.${key}`)}
                </p>
                <Icon className={`size-4 ${iconClasses[variant]}`} />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950 dark:text-slate-50">
                {formatDashboardNumber(value, locale)}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            {t("provinceTitle")}
          </h4>
          {data.byProvince.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {t("emptyProvince")}
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.byProvince.slice(0, 6).map((province) => (
                <div
                  className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"
                  key={province.provinceCode}
                >
                  <span className="truncate text-slate-600 dark:text-slate-300">
                    {province.provinceName}
                  </span>
                  <span className="ml-3 font-semibold tabular-nums text-slate-950 dark:text-slate-50">
                    {formatDashboardNumber(province.total, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
