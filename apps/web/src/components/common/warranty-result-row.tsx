import { warrantyLookupEmptyValue } from "@/src/constants/warranty.constants";
import type { ReactNode } from "react";

type WarrantyResultRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

export function WarrantyResultRow({
  icon,
  label,
  value,
}: WarrantyResultRowProps) {
  const displayValue =
    typeof value === "string"
      ? value || warrantyLookupEmptyValue
      : (value ?? warrantyLookupEmptyValue);

  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase text-stone-gray sm:min-w-40">
        {icon}
        {label}
      </span>
      <div className="break-words text-sm font-semibold text-deep-black sm:text-right">
        {displayValue}
      </div>
    </div>
  );
}
