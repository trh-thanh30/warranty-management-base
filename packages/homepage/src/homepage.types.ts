import type { ReactNode } from "react";
import type { WebsiteHomepageCopy } from "@repo/shared";

export type HomepageLandingCopy = WebsiteHomepageCopy["landing"];

export type HomepageRendererProps = {
  brandStoryImageUrl?: string;
  copy: HomepageLandingCopy;
  heroImageUrl: string;
  networkContent?: ReactNode;
  technologyOriginImageUrl?: string;
};
