import type { ComponentProps, ReactNode } from "react";
import { Input } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { FormField } from "@/src/components/common/form-field";

type WarrantyClaimFormSectionProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function WarrantyClaimFormSection({
  children,
  description,
  title,
}: WarrantyClaimFormSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <hr className="mt-4 border-slate-200 dark:border-slate-800" />
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function WarrantyClaimReadOnlyInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700",
        className,
      )}
      readOnly
      {...props}
    />
  );
}

export function WarrantyClaimReadOnlyField({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <FormField htmlFor={id} label={label}>
      <WarrantyClaimReadOnlyInput id={id} value={value} />
    </FormField>
  );
}
