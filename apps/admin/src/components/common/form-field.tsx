import type { ReactNode } from "react";
import { Label } from "@repo/ui";

type FormFieldProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
};

export function FormField({
  children,
  description,
  error,
  htmlFor,
  label,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
