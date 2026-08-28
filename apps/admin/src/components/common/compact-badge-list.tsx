"use client";

import type { BadgeProps } from "@repo/ui";
import {
  Badge,
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import type { ReactNode } from "react";

type CompactBadgeListProps = {
  badgeClassName?: string;
  badgeVariant?: BadgeProps["variant"];
  className?: string;
  emptyContent?: ReactNode;
  items: readonly string[];
  maxVisibleItems?: number;
  monospace?: boolean;
  overflowAriaLabel: (hiddenCount: number) => string;
  showItemTooltip?: boolean;
};

export function CompactBadgeList({
  badgeClassName,
  badgeVariant = "info",
  className,
  emptyContent = "-",
  items,
  maxVisibleItems = 2,
  monospace = false,
  overflowAriaLabel,
  showItemTooltip = false,
}: CompactBadgeListProps) {
  const normalizedItems = items.map((item) => item.trim()).filter(Boolean);
  const visibleItemCount = Math.max(0, Math.floor(maxVisibleItems));
  const visibleItems = normalizedItems.slice(0, visibleItemCount);
  const hiddenItems = normalizedItems.slice(visibleItemCount);

  if (!normalizedItems.length) return <>{emptyContent}</>;

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "flex max-w-[18rem] flex-wrap items-center gap-1.5",
          className,
        )}
      >
        {visibleItems.map((item, index) => (
          <CompactBadgeItem
            badgeClassName={badgeClassName}
            badgeVariant={badgeVariant}
            item={item}
            key={`${item}-${index}`}
            monospace={monospace}
            showTooltip={showItemTooltip}
          />
        ))}

        {hiddenItems.length ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={overflowAriaLabel(hiddenItems.length)}
                className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                type="button"
              >
                +{hiddenItems.length}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-80 px-3 py-2" side="top">
              <ul className="space-y-1">
                {hiddenItems.map((item, index) => (
                  <li
                    className={cn("wrap-break-word", monospace && "font-mono")}
                    key={`${item}-${index}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

type CompactBadgeItemProps = {
  badgeClassName?: string;
  badgeVariant: BadgeProps["variant"];
  item: string;
  monospace: boolean;
  showTooltip: boolean;
};

function CompactBadgeItem({
  badgeClassName,
  badgeVariant,
  item,
  monospace,
  showTooltip,
}: CompactBadgeItemProps) {
  const badge = (
    <Badge
      aria-label={showTooltip ? item : undefined}
      className={cn(
        "max-w-52 min-w-0",
        monospace && "font-mono",
        showTooltip &&
          "cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        badgeClassName,
      )}
      tabIndex={showTooltip ? 0 : undefined}
      variant={badgeVariant}
    >
      <span className="truncate">{item}</span>
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-80 wrap-break-word" side="top">
        {item}
      </TooltipContent>
    </Tooltip>
  );
}
