import type { HomepageLandingCopy } from "../homepage.types";
import { EditableText } from "../editable-text";

export function HeroSection({
  copy,
  imageUrl,
}: {
  copy: HomepageLandingCopy["hero"];
  imageUrl: string;
}) {
  return (
    <section
      className="relative grid min-h-[calc(100svh-5.25rem)] overflow-hidden bg-surface-muted lg:grid-cols-2"
      data-homepage-section="hero"
    >
      <div className="order-2 flex flex-col justify-center gap-6 px-6 py-12 sm:px-12 lg:order-1 lg:px-20">
        <EditableText
          as="p"
          className="w-fit rounded-md bg-premium-red px-4 py-2 uppercase tracking-widest !text-white"
          value={copy.eyebrow}
        />
        <h1 className="flex flex-wrap gap-x-3 uppercase leading-tight">
          <EditableText value={copy.titlePrefix} />
          <EditableText value={copy.titleHighlight} />
          <EditableText value={copy.titleSuffix} />
        </h1>
        <EditableText
          as="p"
          className="max-w-2xl leading-relaxed"
          value={copy.description}
        />
        <div className="grid grid-cols-3 gap-4 border-y border-border-gray py-5">
          <HeroStat label={copy.uvLabel} value={`${copy.uvPercent}%`} />
          <HeroStat label={copy.originLabel} value={`${copy.originPercent}%`} />
          <HeroStat
            label={copy.warrantyLabel}
            value={`${copy.warrantyYears}${copy.yearsSuffix.content}`}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <EditableText
            as="span"
            className="rounded-md bg-premium-red px-7 py-4 uppercase !text-white"
            value={copy.primaryCta}
          />
          <EditableText
            as="span"
            className="rounded-md border border-border-gray bg-white px-7 py-4 uppercase"
            value={copy.dealerCta}
          />
        </div>
      </div>
      <div className="order-1 min-h-72 lg:order-2">
        <img
          alt={copy.titleHighlight.content}
          className="h-full w-full object-cover"
          src={imageUrl}
        />
      </div>
    </section>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: HomepageLandingCopy["hero"]["uvLabel"];
  value: string;
}) {
  return (
    <div className="border-l-2 border-premium-red pl-4">
      <strong className="text-3xl text-premium-red">{value}</strong>
      <EditableText as="p" className="mt-1 uppercase" value={label} />
    </div>
  );
}
