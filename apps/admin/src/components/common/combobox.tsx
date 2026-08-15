"use client";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { filterComboboxItem } from "./combobox.utils";

type ComboboxContextValue = {
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  open: boolean;
  value: string;
};

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function Combobox({
  children,
  disabled,
  onValueChange,
  shouldFilter = true,
  value,
}: {
  children: ReactNode;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  shouldFilter?: boolean;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const contextValue = useMemo(
    () => ({
      disabled,
      onOpenChange: setOpen,
      onValueChange,
      open,
      value,
    }),
    [disabled, onValueChange, open, value],
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen}>
        <CommandPrimitive
          filter={filterComboboxItem}
          shouldFilter={shouldFilter}
        >
          {children}
        </CommandPrimitive>
      </Popover>
    </ComboboxContext.Provider>
  );
}

export function ComboboxTrigger({
  id,
  placeholder,
  selectedLabel,
}: {
  id: string;
  placeholder: string;
  selectedLabel?: string;
}) {
  const combobox = useComboboxContext();

  return (
    <PopoverTrigger asChild>
      <Button
        aria-expanded={combobox.open}
        className="h-10 w-full justify-between border-slate-300 px-3 font-normal shadow-sm dark:border-slate-700"
        disabled={combobox.disabled}
        id={id}
        role="combobox"
        type="button"
        variant="secondary"
      >
        <span
          className={cn(
            "min-w-0 truncate",
            selectedLabel
              ? "text-slate-950 dark:text-slate-50"
              : "text-slate-400",
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="ml-2 size-4 shrink-0 text-slate-500"
        />
      </Button>
    </PopoverTrigger>
  );
}

export function ComboboxContent({ children }: { children: ReactNode }) {
  return (
    <PopoverContent
      align="start"
      className="w-(--radix-popover-trigger-width) p-0"
    >
      {children}
    </PopoverContent>
  );
}

export function ComboboxInput({
  onValueChange,
  placeholder,
  showTrigger = true,
  value,
}: {
  onValueChange?: (value: string) => void;
  placeholder: string;
  showTrigger?: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
      {showTrigger ? (
        <Search aria-hidden="true" className="mr-2 size-4 text-slate-400" />
      ) : null}
      <CommandPrimitive.Input
        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        onValueChange={onValueChange}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

export function ComboboxList({
  children,
  onReachEnd,
}: {
  children: ReactNode;
  onReachEnd?: () => void;
}) {
  return (
    <CommandPrimitive.List
      className="max-h-72 overflow-y-auto p-1"
      onScroll={(event) => {
        const target = event.currentTarget;
        const distanceToEnd =
          target.scrollHeight - target.scrollTop - target.clientHeight;
        if (distanceToEnd <= 32) onReachEnd?.();
      }}
    >
      {children}
    </CommandPrimitive.List>
  );
}

export function ComboboxEmpty({ children }: { children: ReactNode }) {
  return (
    <CommandPrimitive.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {children}
    </CommandPrimitive.Empty>
  );
}

export function ComboboxLoading({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function ComboboxItem({
  children,
  keywords,
  value,
}: {
  children: ReactNode;
  keywords?: string[];
  value: string;
}) {
  const combobox = useComboboxContext();
  const selected = combobox.value === value;
  const searchKeywords =
    typeof children === "string" ? [children, ...(keywords ?? [])] : keywords;

  return (
    <CommandPrimitive.Item
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-950 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:aria-selected:bg-slate-900 dark:aria-selected:text-slate-50"
      keywords={searchKeywords}
      onSelect={() => {
        combobox.onValueChange(value);
        combobox.onOpenChange(false);
      }}
      value={value}
    >
      <Check
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="min-w-0 truncate">{children}</span>
    </CommandPrimitive.Item>
  );
}

function useComboboxContext() {
  const context = useContext(ComboboxContext);

  if (!context) {
    throw new Error("Combobox components must be used inside <Combobox />");
  }

  return context;
}
