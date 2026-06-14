import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Card, CardContent } from "@repo/ui";

type StatePanelProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function StatePanel({
  action,
  description,
  icon: Icon,
  title,
}: StatePanelProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        {action ? (
          <div className="mt-4">{action}</div>
        ) : (
          <Button className="mt-4">Create item</Button>
        )}
      </CardContent>
    </Card>
  );
}
