import { AlertCircle, BarChart3, RotateCw } from "lucide-react";
import { Button, Skeleton } from "@repo/ui";

type DashboardWidgetStateProps = {
  description: string;
  loading?: boolean;
  onRetry?: () => void;
  title: string;
};

export function DashboardWidgetState({
  description,
  loading = false,
  onRetry,
  title,
}: DashboardWidgetStateProps) {
  if (loading) {
    return (
      <div className="space-y-3 py-4" aria-label={title} aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-4/5" />
      </div>
    );
  }

  const Icon = onRetry ? AlertCircle : BarChart3;

  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-950 dark:text-slate-50">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {onRetry ? (
        <Button
          className="mt-4"
          onClick={onRetry}
          size="sm"
          variant="secondary"
        >
          <RotateCw className="size-4" />
          {title}
        </Button>
      ) : null}
    </div>
  );
}
