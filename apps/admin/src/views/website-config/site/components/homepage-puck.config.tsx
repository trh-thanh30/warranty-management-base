import type {
  Config,
  Field,
  Fields,
  Permissions,
  WithPuckProps,
} from "@puckeditor/core";
import {
  B2bSection,
  BrandStorySection,
  HeadingSection,
  HeroSection,
  NetworkSection,
  TechnologyOriginSection,
} from "@repo/homepage";
import type { WebsiteHomepageCopy, WebsiteTextStyle } from "@repo/shared";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import type { ReactNode } from "react";
import { HomepageStyleField } from "./homepage-style-field";
import {
  flattenSection,
  type HomepageLandingCopy,
  type HomepagePuckComponents,
  type HomepagePuckSectionProps,
  type HomepageSectionKey,
  unflattenSection,
} from "./homepage-puck.adapters";

export const homepageEditorPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
  edit: true,
} as const satisfies Permissions;

export type HomepageEditorLabels = {
  align: string;
  bold: string;
  color: string;
  font: string;
  italic: string;
  sectionFields: Record<string, string>;
  sections: Record<
    HomepageSectionKey | "brandStory" | "technologyOrigin",
    string
  >;
  size: string;
};

export function getHomepageEditorPermissions(readOnly: boolean): Permissions {
  return readOnly
    ? { ...homepageEditorPermissions, edit: false }
    : homepageEditorPermissions;
}

export function createHomepagePuckConfig({
  heroImageUrl,
  labels,
  networkContent,
}: {
  heroImageUrl: string;
  labels: HomepageEditorLabels;
  networkContent?: ReactNode;
}): Config<HomepagePuckComponents> {
  const defaults = DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing;

  return {
    components: {
      HomepageHero: {
        label: labels.sections.hero,
        defaultProps: propsFor("homepage-hero", defaults.hero),
        fields: fieldsFor("hero", defaults.hero, labels),
        permissions: homepageEditorPermissions,
        render: (props) => (
          <HeroSection
            copy={sectionFromProps(props, "hero")}
            imageUrl={heroImageUrl}
          />
        ),
      },
      HomepageBrandStory: {
        label: labels.sections.brandStory,
        defaultProps: propsFor("homepage-brand-story", defaults.brandHeritage),
        fields: fieldsFor("brandHeritage", defaults.brandHeritage, labels, [
          "brandLabel",
          "headlineLine1",
          "headlineLine2Prefix",
          "headlineHighlight",
          "headlineLine3",
          "descriptionPrimary",
          "descriptionSecondary",
        ]),
        permissions: homepageEditorPermissions,
        render: (props) => (
          <BrandStorySection copy={sectionFromProps(props, "brandHeritage")} />
        ),
      },
      HomepageTechnologyOrigin: {
        label: labels.sections.technologyOrigin,
        defaultProps: propsFor(
          "homepage-technology-origin",
          defaults.brandHeritage,
        ),
        fields: fieldsFor("brandHeritage", defaults.brandHeritage, labels, [
          "originEyebrow",
          "originTitle",
          "originDescriptionPrimary",
          "originDescriptionSecondary",
        ]),
        permissions: homepageEditorPermissions,
        render: (props) => (
          <TechnologyOriginSection
            copy={sectionFromProps(props, "brandHeritage")}
          />
        ),
      },
      HomepageCoreTech: headingConfig("coreTech", defaults.coreTech, labels),
      HomepageMilestones: headingConfig(
        "milestones",
        defaults.milestones,
        labels,
        true,
      ),
      HomepagePillars: headingConfig("pillars", defaults.pillars, labels),
      HomepageNetwork: {
        label: labels.sections.network,
        defaultProps: propsFor("homepage-network", defaults.network),
        fields: fieldsFor("network", defaults.network, labels),
        permissions: homepageEditorPermissions,
        render: (props) => (
          <NetworkSection
            copy={sectionFromProps(props, "network")}
            networkContent={networkContent}
          />
        ),
      },
      HomepageTestimonials: headingConfig(
        "testimonials",
        defaults.testimonials,
        labels,
      ),
      HomepageB2b: {
        label: labels.sections.b2b,
        defaultProps: propsFor("homepage-b2b", defaults.b2b),
        fields: fieldsFor("b2b", defaults.b2b, labels),
        permissions: homepageEditorPermissions,
        render: (props) => <B2bSection copy={sectionFromProps(props, "b2b")} />,
      },
    },
    root: {
      render: ({ children }) => (
        <main className="w-full overflow-x-clip bg-white text-deep-black">
          {children}
        </main>
      ),
    },
  };
}

function headingConfig<
  Section extends "coreTech" | "milestones" | "pillars" | "testimonials",
>(
  section: Section,
  defaults: HomepageLandingCopy[Section],
  labels: HomepageEditorLabels,
  muted = false,
) {
  return {
    label: labels.sections[section],
    defaultProps: propsFor(`homepage-${toKebabCase(section)}`, defaults),
    fields: fieldsFor(section, defaults, labels),
    permissions: homepageEditorPermissions,
    render: (props: WithPuckProps<HomepagePuckSectionProps>) => {
      const copy = sectionFromProps(
        props as HomepagePuckSectionProps,
        section,
      ) as {
        description?: WebsiteHomepageCopy["landing"]["coreTech"]["description"];
        eyebrow: WebsiteHomepageCopy["landing"]["coreTech"]["eyebrow"];
        title: WebsiteHomepageCopy["landing"]["coreTech"]["title"];
      };
      return (
        <HeadingSection
          description={copy.description}
          eyebrow={copy.eyebrow}
          id={toKebabCase(section)}
          muted={muted}
          title={copy.title}
        />
      );
    },
  };
}

function propsFor(
  id: string,
  section: HomepageLandingCopy[HomepageSectionKey],
): HomepagePuckSectionProps {
  return { id, ...flattenSection(section) };
}

function fieldsFor(
  section: HomepageSectionKey,
  values: HomepageLandingCopy[HomepageSectionKey],
  labels: HomepageEditorLabels,
  editableKeys?: readonly string[],
): Fields<HomepagePuckSectionProps> {
  const fields: Record<string, Field> = {};

  for (const [key, value] of Object.entries(values)) {
    if (editableKeys && !editableKeys.includes(key)) continue;
    if (typeof value === "object" && value && "content" in value) {
      fields[`${key}Content`] = {
        type: key.toLowerCase().includes("description") ? "textarea" : "text",
        contentEditable: true,
        label: labels.sectionFields[key] ?? key,
      };
      fields[`${key}Style`] = {
        type: "custom",
        label: `${labels.sectionFields[key] ?? key} - ${labels.size}/${labels.color}`,
        render: ({ onChange, readOnly, value: style }) => (
          <HomepageStyleField
            labels={labels}
            onChange={onChange}
            readOnly={readOnly}
            value={style as WebsiteTextStyle}
          />
        ),
      };
    } else if (typeof value === "number") {
      fields[key] = {
        type: "number",
        label: labels.sectionFields[key] ?? key,
        min: 0,
      };
    }
  }

  if (Object.keys(fields).length === 0) {
    throw new Error(`Homepage section has no editable fields: ${section}`);
  }

  return fields as Fields<HomepagePuckSectionProps>;
}

function sectionFromProps<Section extends HomepageSectionKey>(
  props: HomepagePuckSectionProps,
  section: Section,
): WebsiteHomepageCopy["landing"][Section] {
  return unflattenSection(props, section, {
    allowRenderableContent: true,
  }) as WebsiteHomepageCopy["landing"][Section];
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
