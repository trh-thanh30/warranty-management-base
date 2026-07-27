"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  UpdateWebsiteSiteSettingBody,
  WebsiteConfigOverview,
  WebsiteSiteSetting,
  WebsiteVersionedMutation,
} from "@repo/shared";
import { websiteConfigService } from "@/src/services/website-config/website-config.service";

export const websiteConfigKeys = {
  all: ["website-config"] as const,
  overview: () => [...websiteConfigKeys.all, "overview"] as const,
  site: () => [...websiteConfigKeys.all, "site"] as const,
};

type EnabledOption<T> = Pick<UseQueryOptions<T>, "enabled">;

function useConfigMutation<TBody, TResult>(
  mutationFn: (body: TBody) => Promise<TResult>,
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
      void queryClient.invalidateQueries({
        queryKey: websiteConfigKeys.overview(),
      });
    },
  });
}

export function useWebsiteConfigOverview(
  options?: EnabledOption<WebsiteConfigOverview>,
) {
  return useQuery({
    ...options,
    queryFn: websiteConfigService.overview,
    queryKey: websiteConfigKeys.overview(),
  });
}

export function useWebsiteSite(options?: EnabledOption<WebsiteSiteSetting>) {
  return useQuery({
    ...options,
    queryFn: websiteConfigService.getSite,
    queryKey: websiteConfigKeys.site(),
  });
}

export function useSaveWebsiteSite() {
  return useConfigMutation<UpdateWebsiteSiteSettingBody, WebsiteSiteSetting>(
    websiteConfigService.saveSite,
    websiteConfigKeys.site(),
  );
}

export function usePublishWebsiteSite() {
  return useConfigMutation<WebsiteVersionedMutation, WebsiteSiteSetting>(
    websiteConfigService.publishSite,
    websiteConfigKeys.site(),
  );
}
