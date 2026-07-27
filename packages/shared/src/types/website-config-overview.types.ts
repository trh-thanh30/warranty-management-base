import type { WebsiteRevisionMeta } from "./website-config-common.types.ts";

export type WebsiteConfigOverviewStatus =
  | "NOT_CONFIGURED"
  | "DRAFT"
  | "PUBLISHED"
  | "UNPUBLISHED_CHANGES";

export type WebsiteConfigOverviewItem = WebsiteRevisionMeta & {
  key: "site";
  status: WebsiteConfigOverviewStatus;
  validationWarningCount: number;
};

export type WebsiteConfigOverview = {
  items: WebsiteConfigOverviewItem[];
};
