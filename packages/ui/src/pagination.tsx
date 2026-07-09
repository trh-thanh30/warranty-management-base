import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

type PaginationButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
};

export function PaginationButton({
  className,
  isActive,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
        className,
      )}
      type="button"
      {...props}
    />
  );
}

type PaginationDirectionButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: LucideIcon;
  };

function PaginationDirectionButton({
  children,
  className,
  icon: Icon,
  ...props
}: PaginationDirectionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium transition-colors",
        "text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "dark:text-slate-300 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300",
        className,
      )}
      type="button"
      {...props}
    >
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}

export function PaginationPrevious(
  props: Omit<PaginationDirectionButtonProps, "icon">,
) {
  return <PaginationDirectionButton icon={ChevronLeft} {...props} />;
}

export function PaginationNext({
  children,
  className,
  ...props
}: Omit<PaginationDirectionButtonProps, "icon">) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium transition-colors",
        "text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "dark:text-slate-300 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
      <ChevronRight aria-hidden="true" className="size-4" />
    </button>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
