"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-950 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-slate-950 data-[state=checked]:bg-slate-950 data-[state=checked]:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-300 dark:data-[state=checked]:border-slate-50 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:text-slate-950",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
