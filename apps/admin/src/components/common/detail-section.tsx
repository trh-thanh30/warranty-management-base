import type { ReactNode } from "react";

type DetailSectionProps = {
  children: ReactNode;
  headerAside?: ReactNode;
  title: string;
  useDefinitionList?: boolean;
};

/** Shared heading and definition-list layout for detail cards. */
export function DetailSection({
  children,
  headerAside,
  title,
  useDefinitionList = true,
}: DetailSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap sm:gap-3 sm:whitespace-normal">
        <h2 className="min-w-0 truncate text-base font-semibold text-slate-950 dark:text-slate-50 sm:whitespace-normal">
          {title}
        </h2>
        {headerAside}
      </div>
      {useDefinitionList ? (
        <dl className="grid gap-x-8 gap-y-5 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800">
          {children}
        </dl>
      ) : (
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          {children}
        </div>
      )}
    </section>
  );
}
