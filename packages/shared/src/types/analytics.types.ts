import type { ProductStatus } from "./product.types.ts";
import type {
  WarrantyActivationRequestSource,
  WarrantyActivationRequestStatus,
} from "./warranty-activation-request.types.ts";
import type {
  WarrantyClaimPriority,
  WarrantyClaimStatus,
} from "./warranty-claim.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";

export type AnalyticsRange = {
  from: string;
  to: string;
};

export type AnalyticsDashboardOverview = {
  range: AnalyticsRange;
  totals: {
    customers: number;
    products: number;
    activeWarranties: number;
    expiredWarranties: number;
    openClaims: number;
    overdueClaims: number;
    completedClaims: number;
    serviceCenters: number;
  };
  deltas: {
    customers: number;
    products: number;
    claims: number;
    completedClaims: number;
  };
};

export type AnalyticsDashboardClaims = {
  total: number;
  createdToday: number;
  createdThisMonth: number;
  overdue: number;
  averageResolutionHours: number | null;
  byStatus: Array<{
    status: WarrantyClaimStatus;
    count: number;
  }>;
  byPriority: Array<{
    priority: WarrantyClaimPriority;
    count: number;
  }>;
  byServiceCenter: Array<{
    serviceCenterId: string | null;
    serviceCenterName: string | null;
    count: number;
  }>;
};

export type AnalyticsTrendMetric =
  | "claims"
  | "claim_completed"
  | "claim_overdue"
  | "warranties"
  | "warranty_activated"
  | "warranty_activation_requests"
  | "products"
  | "customers";

export type AnalyticsTrendInterval = "day" | "week" | "month";

export type AnalyticsDashboardTrends = {
  metric: AnalyticsTrendMetric;
  interval: AnalyticsTrendInterval;
  points: Array<{
    date: string;
    value: number;
    breakdown?: Array<{
      key: string;
      value: number;
    }>;
  }>;
};

export type AnalyticsDashboardWarranties = {
  total: number;
  byStatus: Array<{
    status: WarrantyStatus;
    count: number;
  }>;
  expiringSoon: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  activatedInRange: number;
};

export type AnalyticsDashboardActivationRequests = {
  total: number;
  createdInRange: number;
  pending: number;
  approved: number;
  rejected: number;
  activated: number;
  cancelled: number;
  byStatus: Array<{
    status: WarrantyActivationRequestStatus;
    count: number;
  }>;
  bySource: Array<{
    source: WarrantyActivationRequestSource;
    count: number;
  }>;
};

export type AnalyticsDashboardProducts = {
  total: number;
  byStatus: Array<{
    status: ProductStatus;
    count: number;
  }>;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    count: number;
  }>;
  topBrands: Array<{
    brand: string;
    count: number;
  }>;
};

export type AnalyticsRecentActivity = {
  items: Array<{
    id: string;
    type: "CLAIM_CREATED" | "CLAIM_STATUS_CHANGED" | "WARRANTY_ACTIVATED";
    title: string;
    description: string | null;
    occurredAt: string;
    entity: {
      type: "warranty_claim" | "warranty" | "product";
      id: string;
      code: string | null;
    };
  }>;
};

export type AnalyticsRangeQuery = {
  from?: string;
  to?: string;
  compare?: "previous_period" | "none";
  serviceCenterId?: string;
};

export type AnalyticsTrendsQuery = AnalyticsRangeQuery & {
  metric?: AnalyticsTrendMetric;
  interval?: AnalyticsTrendInterval;
};

export type AnalyticsRecentActivityQuery = {
  limit?: number;
};
