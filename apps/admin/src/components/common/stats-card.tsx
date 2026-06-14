import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  trend: string;
  icon: LucideIcon;
};

export function StatsCard({
  description,
  icon: Icon,
  title,
  value,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
          {trend && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
