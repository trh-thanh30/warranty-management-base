"use client";

import { Button, cn, Input } from "@repo/ui";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SearchDropdownProps<TItem> = {
  emptyLabel: string;
  getItemKey: (item: TItem) => string;
  getItemDisabledReason?: (item: TItem) => string | null | undefined;
  inputClassName?: string;
  isLoading?: boolean;
  items: TItem[];
  loadingLabel: string;
  onItemSelect: (item: TItem) => void;
  onReachEnd?: () => void;
  onSearchChange: (value: string) => void;
  placeholder: string;
  renderItem: (item: TItem) => ReactNode;
  searchValue: string;
  selectedLabel?: string;
};

export function SearchDropdown<TItem>({
  emptyLabel,
  getItemKey,
  getItemDisabledReason,
  inputClassName,
  isLoading,
  items,
  loadingLabel,
  onItemSelect,
  onReachEnd,
  onSearchChange,
  placeholder,
  renderItem,
  searchValue,
  selectedLabel,
}: SearchDropdownProps<TItem>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasSearch = searchValue.trim().length > 0;
  const displayValue = open ? searchValue : (selectedLabel ?? searchValue);
  const showEmpty = !isLoading && items.length === 0;

  const itemKeys = useMemo(
    () => new Set(items.map((item) => getItemKey(item))),
    [getItemKey, items],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-5 size-4 -translate-y-1/2 text-slate-400"
      />
      <Input
        aria-expanded={open}
        className={cn("h-10 pl-9 pr-9", inputClassName)}
        onChange={(event) => {
          onSearchChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        role="combobox"
        value={displayValue}
      />
      {hasSearch || selectedLabel ? (
        <Button
          aria-label="Clear search"
          className="absolute right-1 top-5 size-8 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-700"
          onClick={() => {
            onSearchChange("");
            setOpen(true);
          }}
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
      {open ? (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-lg outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          role="listbox"
        >
          <div
            className="max-h-72 overflow-y-auto"
            onScroll={(event) => {
              const target = event.currentTarget;
              const distanceToEnd =
                target.scrollHeight - target.scrollTop - target.clientHeight;
              if (distanceToEnd <= 32) onReachEnd?.();
            }}
          >
            {items.map((item) => {
              const disabledReason = getItemDisabledReason?.(item);
              const isDisabled = Boolean(disabledReason);

              return (
                <button
                  aria-disabled={isDisabled}
                  className={cn(
                    "flex w-full items-start rounded-sm px-3 py-2 text-left text-sm outline-none",
                    isDisabled
                      ? "cursor-not-allowed text-slate-500 opacity-75 dark:text-slate-400"
                      : "cursor-pointer text-slate-950 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus:bg-slate-900",
                  )}
                  key={getItemKey(item)}
                  onClick={() => {
                    if (isDisabled) return;

                    onItemSelect(item);
                    setOpen(false);
                  }}
                  role="option"
                  title={disabledReason ?? undefined}
                  type="button"
                >
                  {renderItem(item)}
                </button>
              );
            })}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {loadingLabel}
              </div>
            ) : null}
            {showEmpty ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyLabel}
              </div>
            ) : null}
            {!isLoading &&
            items.length > 0 &&
            itemKeys.size !== items.length ? (
              <div className="sr-only" aria-live="polite">
                Duplicate search results hidden.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
