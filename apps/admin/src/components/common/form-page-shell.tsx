import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";

type FormPageShellProps = {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  maxWidthClassName?: string;
  title: string;
  descriptionAccessory?: ReactNode;
};

export function FormPageShell({
  backHref,
  backLabel,
  children,
  description,
  eyebrow,
  maxWidthClassName = "max-w-3xl",
  title,
  descriptionAccessory,
}: FormPageShellProps) {
  return (
    <div className={`mx-auto space-y-6 ${maxWidthClassName}`}>
      <div className="space-y-4">
        <Button asChild size="sm" variant="ghost">
          <Link className="-ml-3 w-fit" href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>

        <div>
          {eyebrow ? (
            <p className="text-sm font-medium uppercase text-slate-500 dark:text-slate-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
            {title}
          </h1>
          {description ? (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description}
              </p>
              {descriptionAccessory ? (
                <div className="w-full shrink-0 sm:w-auto">
                  {descriptionAccessory}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}
