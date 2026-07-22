import type { ReactNode } from "react";
import { Label } from "@repo/ui";

type FormFieldProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor?: string;
  id?: string;
  label: string;
};

export function FormField({
  children,
  description,
  error,
  htmlFor,
  id,
  label,
}: FormFieldProps) {
  const controlId = htmlFor ?? id;

  if (!controlId) {
    throw new Error("FormField requires either an id or htmlFor prop");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={controlId}>{label}</Label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-sm leading-5 text-red-600 dark:text-red-400"
          id={`${controlId}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
