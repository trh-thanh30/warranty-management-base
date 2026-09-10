import type {
  UpdateWebsiteSiteSettingBody,
  WebsiteConfigOverview,
  WebsiteSiteSetting,
  WebsiteVersionedMutation,
} from "@repo/shared";
import { unwrap } from "../service.utils";
import type { WebsiteConfigHttpClient } from "./website-config.types";

export function createWebsiteConfigService(http: WebsiteConfigHttpClient) {
  return {
    overview: () =>
      http.get<WebsiteConfigOverview>("/website-config/overview").then(unwrap),

    getSite: () =>
      http
        .get<WebsiteSiteSetting>("/website-config/site-settings")
        .then(unwrap),
    saveSite: (body: UpdateWebsiteSiteSettingBody) =>
      http
        .patch<WebsiteSiteSetting>("/website-config/site-settings/draft", body)
        .then(unwrap),
    publishSite: (body: WebsiteVersionedMutation) =>
      http
        .post<WebsiteSiteSetting>("/website-config/site-settings/publish", body)
        .then(unwrap),
  };
}
