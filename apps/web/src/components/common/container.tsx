import { cn } from "@repo/ui";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-410 px-6 sm:px-10 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
