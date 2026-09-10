import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  HttpClient,
  PublicWebsiteSiteSetting,
  WebsiteLocale,
} from "@repo/shared";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export class WebsiteConfigService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async getSiteSetting(
    locale: WebsiteLocale,
  ): Promise<PublicWebsiteSiteSetting> {
    const response = await this.http.get<ApiResponse<PublicWebsiteSiteSetting>>(
      "/public/site-settings",
      { params: { locale } },
    );
    return response.data;
  }
}

export const websiteConfigService = new WebsiteConfigService(publicHttpClient);

const getPersistedSiteSetting = unstable_cache(
  (locale: WebsiteLocale) => websiteConfigService.getSiteSetting(locale),
  ["public-site-setting"],
  { revalidate: 60 },
);

export const getCachedSiteSetting = cache(getPersistedSiteSetting);
