import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950",
        secondary:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        success:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        destructive: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
