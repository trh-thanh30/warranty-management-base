import type { ReactNode } from "react";

type ActivationRequestSummaryCardProps = {
  badge: ReactNode;
  children: ReactNode;
  icon: ReactNode;
  meta: string;
  title: string;
};

export function ActivationRequestSummaryCard({
  badge,
  children,
  icon,
  meta,
  title,
}: ActivationRequestSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-md border border-blue-100 bg-white text-sm dark:border-blue-950/60 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950 dark:text-slate-50">
              {title}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {meta}
            </p>
          </div>
        </div>
        {badge}
      </div>

      {children}
    </div>
  );
}

export function SummaryGrid({
  children,
  columns = "lg:grid-cols-3",
}: {
  children: ReactNode;
  columns?: string;
}) {
  return (
    <div
      className={`grid gap-px bg-slate-200 dark:bg-slate-800 sm:grid-cols-2 ${columns}`}
    >
      {children}
    </div>
  );
}

export function SummaryItem({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 bg-white px-4 py-3 dark:bg-slate-950">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
