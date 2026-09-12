import { PUBLIC_DEALER_NETWORK_URL } from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { Building2, Clock3, FileText, ShieldCheck } from "lucide-react";

type WarrantyOtherActionId = "activate" | "request" | "track" | "dealers";

type WarrantyOtherActionsProps = {
  items: ReadonlyArray<{
    id: WarrantyOtherActionId;
    label: string;
  }>;
  title: string;
};

const actionDefinitions = {
  activate: {
    external: false,
    href: APP_ROUTES.warrantyActivate,
    Icon: ShieldCheck,
  },
  request: {
    external: false,
    href: APP_ROUTES.warrantyRequest,
    Icon: FileText,
  },
  track: {
    external: false,
    href: APP_ROUTES.warrantyTrack,
    Icon: Clock3,
  },
  dealers: {
    external: true,
    href: PUBLIC_DEALER_NETWORK_URL,
    Icon: Building2,
  },
} as const;

const actionClassName =
  "group flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-gray  p-3.5 text-deep-black transition-colors duration-200 hover:border-premium-red hover:bg-premium-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2";

export function WarrantyOtherActions({
  items,
  title,
}: WarrantyOtherActionsProps) {
  const columnClassName =
    items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <section className="mx-auto w-full  border-t border-border-gray pt-6">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-stone-gray">
        {title}
      </p>
      <div
        className={`mt-4 grid gap-3 text-center text-xs font-semibold uppercase tracking-wide ${columnClassName}`}
      >
        {items.map(({ id, label }) => {
          const definition = actionDefinitions[id];
          const Icon = definition.Icon;
          const content = (
            <>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{label}</span>
            </>
          );

          if (definition.external) {
            return (
              <a
                className={actionClassName}
                href={definition.href}
                key={id}
                rel="noopener noreferrer"
                target="_blank"
              >
                {content}
              </a>
            );
          }

          return (
            <Link className={actionClassName} href={definition.href} key={id}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
