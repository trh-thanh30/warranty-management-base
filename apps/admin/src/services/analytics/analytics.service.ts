import type {
  AnalyticsDashboardClaims,
  AnalyticsDashboardOverview,
  AnalyticsDashboardProducts,
  AnalyticsDashboardTrends,
  AnalyticsDashboardWarranties,
  AnalyticsRangeQuery,
  AnalyticsRecentActivity,
  AnalyticsRecentActivityQuery,
  AnalyticsTrendsQuery,
  ApiResponse,
} from "@repo/shared";
import { adminHttpClient } from "@/src/lib/admin-http-client";

const BASE_PATH = "/analytics/dashboard";

async function getData<T>(path: string, params?: Record<string, unknown>) {
  const response = await adminHttpClient.get<ApiResponse<T>>(path, { params });
  return response.data.data;
}

export const analyticsService = {
  claims(query?: AnalyticsRangeQuery) {
    return getData<AnalyticsDashboardClaims>(`${BASE_PATH}/claims`, query);
  },

  overview(query?: AnalyticsRangeQuery) {
    return getData<AnalyticsDashboardOverview>(`${BASE_PATH}/overview`, query);
  },

  products() {
    return getData<AnalyticsDashboardProducts>(`${BASE_PATH}/products`);
  },

  recentActivity(query?: AnalyticsRecentActivityQuery) {
    return getData<AnalyticsRecentActivity>(
      `${BASE_PATH}/recent-activity`,
      query,
    );
  },

  trends(query?: AnalyticsTrendsQuery) {
    return getData<AnalyticsDashboardTrends>(`${BASE_PATH}/trends`, query);
  },

  warranties(query?: AnalyticsRangeQuery) {
    return getData<AnalyticsDashboardWarranties>(
      `${BASE_PATH}/warranties`,
      query,
    );
  },
};
