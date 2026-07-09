import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300 [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(2_6_23)] dark:[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(2_6_23)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(248_250_252)]",
        className,
      )}
      {...props}
    />
  );
}
