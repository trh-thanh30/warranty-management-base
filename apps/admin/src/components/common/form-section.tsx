import type { ReactNode } from "react";

type FormSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function FormSection({
  children,
  description,
  title,
}: FormSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
        <hr className="mt-4 border-slate-200 dark:border-slate-800" />
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
