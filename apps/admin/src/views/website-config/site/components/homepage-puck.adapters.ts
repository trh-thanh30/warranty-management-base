import type { Data } from "@puckeditor/core";
import type {
  WebsiteEditableText,
  WebsiteHomepageCopy,
  WebsiteTextStyle,
} from "@repo/shared";
import { isWebsiteEditableText } from "@repo/shared/utils";

export type HomepageLandingCopy = WebsiteHomepageCopy["landing"];
export type HomepageSectionKey = keyof HomepageLandingCopy;
export type HomepagePuckValue = string | number | boolean | WebsiteTextStyle;
export type HomepagePuckSectionProps = {
  id: string;
} & Record<string, HomepagePuckValue>;

export type HomepagePuckComponents = {
  HomepageHero: HomepagePuckSectionProps;
  HomepageBrandHeritage: HomepagePuckSectionProps;
  HomepageCoreTech: HomepagePuckSectionProps;
  HomepageMilestones: HomepagePuckSectionProps;
  HomepagePillars: HomepagePuckSectionProps;
  HomepageNetwork: HomepagePuckSectionProps;
  HomepageTestimonials: HomepagePuckSectionProps;
  HomepageB2b: HomepagePuckSectionProps;
};

type HomepagePuckComponentName = keyof HomepagePuckComponents;

const sectionDefinitions = [
  ["hero", "HomepageHero", "homepage-hero"],
  ["brandHeritage", "HomepageBrandHeritage", "homepage-brand-heritage"],
  ["coreTech", "HomepageCoreTech", "homepage-core-tech"],
  ["milestones", "HomepageMilestones", "homepage-milestones"],
  ["pillars", "HomepagePillars", "homepage-pillars"],
  ["network", "HomepageNetwork", "homepage-network"],
  ["testimonials", "HomepageTestimonials", "homepage-testimonials"],
  ["b2b", "HomepageB2b", "homepage-b2b"],
] as const satisfies ReadonlyArray<
  readonly [HomepageSectionKey, HomepagePuckComponentName, string]
>;

export const homepagePuckSectionIds = sectionDefinitions.map(([, , id]) => id);

export class HomepageEditorDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomepageEditorDataError";
  }
}

export function toHomepagePuckData(
  copy: HomepageLandingCopy,
): Data<HomepagePuckComponents> {
  return {
    root: { props: { title: "Homepage" } },
    content: sectionDefinitions.map(([section, type, id]) => ({
      type,
      props: { id, ...flattenSection(copy[section]) },
    })),
  };
}

export function fromHomepagePuckData(
  data: Data<HomepagePuckComponents>,
): HomepageLandingCopy {
  const result: Partial<HomepageLandingCopy> = {};

  for (const [section, type, id] of sectionDefinitions) {
    const matches = data.content.filter((item) => item.props.id === id);
    if (matches.length !== 1 || matches[0]?.type !== type) {
      throw new HomepageEditorDataError(
        `Expected exactly one ${type} component with id ${id}`,
      );
    }

    const restored = unflattenSection(matches[0].props, section);
    (result as Record<HomepageSectionKey, typeof restored>)[section] = restored;
  }

  return result as HomepageLandingCopy;
}

export function flattenSection(
  section: HomepageLandingCopy[HomepageSectionKey],
): Record<string, HomepagePuckValue> {
  const flattened: Record<string, HomepagePuckValue> = {};

  for (const [key, value] of Object.entries(section)) {
    if (isWebsiteEditableText(value)) {
      const { content, ...style } = value;
      flattened[`${key}Content`] = content;
      flattened[`${key}Style`] = style;
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      flattened[key] = value;
    }
  }

  return flattened;
}

export function unflattenSection(
  props: HomepagePuckSectionProps,
  section: HomepageSectionKey,
): HomepageLandingCopy[HomepageSectionKey] {
  const defaults = sectionShape(section);
  const restored: Record<
    string,
    WebsiteEditableText | string | number | boolean
  > = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (isWebsiteEditableText(defaultValue)) {
      const style = props[`${key}Style`];
      if (!style || typeof style !== "object") {
        throw new HomepageEditorDataError(`Invalid style: ${section}.${key}`);
      }
      const candidate = {
        content: props[`${key}Content`],
        ...style,
      };
      if (!isWebsiteEditableText(candidate)) {
        throw new HomepageEditorDataError(
          `Invalid editable text: ${section}.${key}`,
        );
      }
      restored[key] = candidate;
    } else {
      const value = props[key];
      if (typeof value !== typeof defaultValue) {
        throw new HomepageEditorDataError(`Invalid field: ${section}.${key}`);
      }
      restored[key] = value as string | number | boolean;
    }
  }

  return restored as HomepageLandingCopy[HomepageSectionKey];
}

function sectionShape(section: HomepageSectionKey) {
  const definition = sectionDefinitions.find(([key]) => key === section);
  if (!definition)
    throw new HomepageEditorDataError(`Unknown section: ${section}`);

  // The caller's data supplies values; this object only defines the expected keys.
  return sectionShapeRegistry[section];
}

const textShape: WebsiteEditableText = {
  align: "left",
  bold: false,
  color: "default",
  content: "shape",
  font: "body",
  italic: false,
  size: "m",
};

const sectionShapeRegistry: HomepageLandingCopy = {
  hero: {
    eyebrow: textShape,
    titlePrefix: textShape,
    titleHighlight: textShape,
    titleSuffix: textShape,
    description: textShape,
    primaryCta: textShape,
    dealerCta: textShape,
    uvPercent: 0,
    originPercent: 0,
    warrantyYears: 0,
    uvLabel: textShape,
    originLabel: textShape,
    warrantyLabel: textShape,
    yearsSuffix: textShape,
  },
  brandHeritage: {
    brandLabel: textShape,
    headlineLine1: textShape,
    headlineLine2Prefix: textShape,
    headlineHighlight: textShape,
    headlineLine3: textShape,
    descriptionPrimary: textShape,
    descriptionSecondary: textShape,
    originEyebrow: textShape,
    originTitle: textShape,
    originDescriptionPrimary: textShape,
    originDescriptionSecondary: textShape,
  },
  coreTech: { eyebrow: textShape, title: textShape, description: textShape },
  milestones: { eyebrow: textShape, title: textShape, description: textShape },
  pillars: { eyebrow: textShape, title: textShape },
  network: {
    eyebrow: textShape,
    titlePrefix: textShape,
    titleSuffix: textShape,
    description: textShape,
    viewDealersCta: textShape,
  },
  testimonials: { eyebrow: textShape, title: textShape },
  b2b: {
    eyebrow: textShape,
    title: textShape,
    description: textShape,
    partnerCta: textShape,
  },
};
