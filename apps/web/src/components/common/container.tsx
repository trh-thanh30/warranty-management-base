import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1640px] px-6 sm:px-10 lg:px-12 ${className}`}
    >
      {children}
    </div>
  );
}
