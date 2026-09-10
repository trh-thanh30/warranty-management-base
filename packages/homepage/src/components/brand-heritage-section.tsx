import type { HomepageLandingCopy } from "../homepage.types";
import { EditableText } from "../editable-text";

export function BrandHeritageSection({
  copy,
}: {
  copy: HomepageLandingCopy["brandHeritage"];
}) {
  return (
    <section
      className="space-y-16 bg-white px-6 py-20 lg:px-20"
      data-homepage-section="brand-heritage"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <EditableText
            as="p"
            className="uppercase tracking-widest"
            value={copy.brandLabel}
          />
          <h2 className="flex flex-wrap gap-x-3 uppercase">
            <EditableText value={copy.headlineLine1} />
            <EditableText value={copy.headlineLine2Prefix} />
            <EditableText value={copy.headlineHighlight} />
            <EditableText value={copy.headlineLine3} />
          </h2>
          <EditableText
            as="p"
            className="leading-relaxed"
            value={copy.descriptionPrimary}
          />
          <EditableText
            as="p"
            className="leading-relaxed"
            value={copy.descriptionSecondary}
          />
        </div>
        <div className="space-y-5 border-l border-border-gray pl-8">
          <EditableText
            as="p"
            className="uppercase tracking-widest"
            value={copy.originEyebrow}
          />
          <EditableText
            as="h2"
            className="uppercase"
            value={copy.originTitle}
          />
          <EditableText
            as="p"
            className="leading-relaxed"
            value={copy.originDescriptionPrimary}
          />
          <EditableText
            as="p"
            className="leading-relaxed"
            value={copy.originDescriptionSecondary}
          />
        </div>
      </div>
    </section>
  );
}
