import type { HomepageLandingCopy } from "../homepage.types";
import { EditableText } from "../editable-text";

export function BrandHeritageSection({
  copy,
  storyImageUrl,
  technologyOriginImageUrl,
}: {
  copy: HomepageLandingCopy["brandHeritage"];
  storyImageUrl?: string;
  technologyOriginImageUrl?: string;
}) {
  return (
    <div data-homepage-section="brand-heritage">
      <BrandStorySection copy={copy} imageUrl={storyImageUrl} />
      <TechnologyOriginSection
        copy={copy}
        imageUrl={technologyOriginImageUrl}
      />
    </div>
  );
}

export function BrandStorySection({
  copy,
  imageUrl,
}: {
  copy: HomepageLandingCopy["brandHeritage"];
  imageUrl?: string;
}) {
  return (
    <section
      className="bg-white px-6 py-20 lg:px-20"
      data-homepage-section="brand-story"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="max-w-3xl space-y-5">
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
        {imageUrl ? (
          <img
            alt=""
            className="h-full min-h-72 w-full rounded-sm object-cover"
            src={imageUrl}
          />
        ) : null}
      </div>
    </section>
  );
}

export function TechnologyOriginSection({
  copy,
  imageUrl,
}: {
  copy: HomepageLandingCopy["brandHeritage"];
  imageUrl?: string;
}) {
  return (
    <section
      className="bg-surface-muted px-6 py-20 lg:px-20"
      data-homepage-section="technology-origin"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
        {imageUrl ? (
          <img
            alt=""
            className="order-2 h-full min-h-72 w-full rounded-sm object-cover lg:order-1"
            src={imageUrl}
          />
        ) : null}
        <div className="order-1 max-w-3xl space-y-5 border-l border-border-gray pl-8 lg:order-2">
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
