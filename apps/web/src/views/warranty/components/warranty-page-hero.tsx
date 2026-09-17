import { Container } from "@/src/components/common/container";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";

export type WarrantyPageHeroProps = {
  alt: string;
  compact?: boolean;
  description: string;
  eyebrow: string;
  imageSrc?: string;
  title: string;
};

export function WarrantyPageHero({
  alt,
  compact = false,
  description,
  eyebrow,
  imageSrc = "/708986914_976804048389364_3900113787497783781_n.jpg",
  title,
}: WarrantyPageHeroProps) {
  return (
    <section
      className={cn(
        "relative flex w-full items-center overflow-hidden bg-deep-black",
        compact ? "h-55 sm:h-70" : "h-65 sm:h-90",
      )}
    >
      <Image
        alt={alt}
        className="object-cover opacity-35"
        fill
        priority
        sizes="100vw"
        src={imageSrc}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-linear-to-r from-deep-black via-deep-black/80 to-transparent"
      />
      <Container
        className={cn(
          "relative z-20 space-y-3",
          compact ? "max-w-350" : "max-w-360",
        )}
      >
        <span className="inline-block rounded-md bg-premium-red px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {eyebrow}
        </span>
        <h1 className="font-condensed text-3xl font-semibold uppercase leading-tight tracking-wider text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-xl text-sm font-medium text-white/80 sm:text-base">
          {description}
        </p>
      </Container>
    </section>
  );
}
