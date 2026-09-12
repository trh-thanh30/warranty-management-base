import { cn } from "@repo/ui/lib/utils";

type WarrantyPageHeadingProps = {
  accent?: boolean;
  className?: string;
  description: string;
  descriptionClassName?: string;
  level?: 2 | 3;
  title: string;
};

export function WarrantyPageHeading({
  accent = false,
  className,
  description,
  descriptionClassName,
  level = 2,
  title,
}: WarrantyPageHeadingProps) {
  const Heading = level === 3 ? "h3" : "h2";

  return (
    <header
      className={cn("mx-auto max-w-2xl space-y-2 text-center", className)}
    >
      <Heading className="text-2xl font-semibold uppercase tracking-wider text-deep-black sm:text-3xl">
        {title}
      </Heading>
      <p
        className={cn(
          "text-sm text-stone-gray sm:text-base",
          descriptionClassName,
        )}
      >
        {description}
      </p>
      {accent ? (
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-0.75 w-20 bg-premium-red"
        />
      ) : null}
    </header>
  );
}
