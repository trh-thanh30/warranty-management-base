import type { LucideIcon } from "lucide-react";

export type WarrantyProcessStep = {
  number: string;
  Icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
};

type WarrantyProcessStepsProps = {
  steps: readonly WarrantyProcessStep[];
};

export function WarrantyProcessSteps({ steps }: WarrantyProcessStepsProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-0 py-2 sm:px-2 sm:py-4">
      <ol className="grid gap-6 sm:grid-cols-3">
        {steps.map(({ number, Icon, badge, title, description }) => (
          <li
            className="group flex h-[230px] flex-col justify-between rounded-md border border-border-gray bg-white p-6 text-left shadow-md transition-all hover:border-premium-red hover:shadow-xl"
            key={number}
          >
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-md border border-border-gray bg-surface-muted text-stone-gray transition-colors group-hover:border-premium-red/30 group-hover:text-premium-red">
                <Icon className="size-6" strokeWidth={1.8} />
              </div>
              <span className="font-condensed text-4xl font-semibold text-stone-gray/20 transition-colors group-hover:text-premium-red/30">
                {number}
              </span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                {badge}
              </span>
              <h3 className="text-lg font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red sm:text-xl">
                {title}
              </h3>
              <p className="text-sm font-medium text-stone-gray">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
