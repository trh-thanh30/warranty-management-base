import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

type WarrantyFormCardProps = {
  children: ReactNode;
  className?: string;
};

export function WarrantyFormCard({
  children,
  className,
}: WarrantyFormCardProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full  rounded-md border border-border-gray  p-6 shadow-md sm:p-10",
        className,
      )}
    >
      {children}
    </section>
  );
}
