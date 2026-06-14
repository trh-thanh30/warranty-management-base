import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-slate-200 dark:border-slate-800",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-200 transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60 dark:data-[state=selected]:bg-slate-900",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-11 px-3 text-left align-middle text-xs font-medium uppercase text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-3 py-3 align-middle text-slate-700 dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
