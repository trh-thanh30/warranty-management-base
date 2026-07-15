# Analytics API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/analytics
```

Analytics API là read model cho Admin Dashboard. FE admin dùng module này để render KPI, chart và recent activity thay vì gọi nhiều list endpoint như `products`, `customers`, `warranties`, `warranty-claims` rồi tự aggregate ở client.

## Trạng thái

Status: `implemented`

Đã có:

- Dashboard overview KPI.
- Claim metrics theo status, priority, service center.
- Time-series trends theo ngày/tuần/tháng.
- Warranty aggregate và expiring soon.
- Product aggregate theo status/category/top brand.
- Recent activity feed.
- Shared types trong `@repo/shared`.

## Base route

```txt
/api/v1/analytics
```

## Auth

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

## Permission

Tất cả endpoint analytics cần:

```txt
DASHBOARD_VIEW
```

FE nên guard route `/dashboard` bằng `PERMISSIONS.DASHBOARD_VIEW`.

## Shared types FE nên dùng

Import từ:

```ts
import type {
  AnalyticsDashboardClaims,
  AnalyticsDashboardOverview,
  AnalyticsDashboardProducts,
  AnalyticsDashboardTrends,
  AnalyticsDashboardWarranties,
  AnalyticsRecentActivity,
  AnalyticsRangeQuery,
  AnalyticsRecentActivityQuery,
  AnalyticsTrendsQuery,
} from "@repo/shared/types";
```

File contract:

```txt
packages/shared/src/types/analytics.types.ts
```

## Query range dùng chung

Các endpoint dashboard chính nhận range:

```ts
type AnalyticsRangeQuery = {
  from?: string;
  to?: string;
  compare?: "previous_period" | "none";
  serviceCenterId?: string;
};
```

Notes cho FE:

- `from` và `to` là ISO date string hoặc `YYYY-MM-DD`.
- Nếu không truyền `from/to`, BE mặc định lấy 30 ngày gần nhất.
- `serviceCenterId` chỉ apply cho dữ liệu liên quan claim/service center.
- `compare` hiện phục vụ intent period comparison; overview đang trả `deltas`.

## Endpoints

### GET /api/v1/analytics/dashboard/overview

Dùng cho: KPI cards đầu dashboard.

Query:

```ts
type OverviewQuery = AnalyticsRangeQuery;
```

Response:

```ts
type AnalyticsDashboardOverview = {
  range: {
    from: string;
    to: string;
  };
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
```

UI mapping gợi ý:

- `totals.customers`: card "Customers".
- `totals.products`: card "Products".
- `totals.activeWarranties`: card "Active warranties".
- `totals.openClaims`: card "Open claims".
- `totals.overdueClaims`: badge/alert card, dùng màu cảnh báo.
- `deltas.*`: hiển thị tăng/giảm so với previous period.

### GET /api/v1/analytics/dashboard/claims

Dùng cho: claim summary widget, status donut/bar, priority breakdown, service center workload.

Query:

```ts
type ClaimsQuery = AnalyticsRangeQuery;
```

Response:

```ts
type AnalyticsDashboardClaims = {
  total: number;
  createdToday: number;
  createdThisMonth: number;
  overdue: number;
  averageResolutionHours: number | null;
  byStatus: Array<{
    status:
      | "SUBMITTED"
      | "REVIEWING"
      | "APPROVED"
      | "REJECTED"
      | "IN_REPAIR"
      | "COMPLETED"
      | "CANCELLED";
    count: number;
  }>;
  byPriority: Array<{
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    count: number;
  }>;
  byServiceCenter: Array<{
    serviceCenterId: string | null;
    serviceCenterName: string | null;
    count: number;
  }>;
};
```

FE notes:

- `averageResolutionHours = null` khi chưa có claim resolved trong range.
- `byServiceCenter.serviceCenterName = null` nghĩa là claim chưa assign hoặc service center không còn tìm thấy.
- Dashboard nên link các card sang `/warranty-claims` với filter tương ứng nếu cần drill-down.

### GET /api/v1/analytics/dashboard/trends

Dùng cho: line/bar chart theo thời gian.

Query:

```ts
type AnalyticsTrendsQuery = AnalyticsRangeQuery & {
  metric?:
    | "claims"
    | "claim_completed"
    | "claim_overdue"
    | "warranties"
    | "warranty_activated"
    | "products"
    | "customers";
  interval?: "day" | "week" | "month";
};
```

Default:

```txt
metric = claims
interval = day
```

Response:

```ts
type AnalyticsDashboardTrends = {
  metric: AnalyticsTrendsQuery["metric"];
  interval: "day" | "week" | "month";
  points: Array<{
    date: string;
    value: number;
  }>;
};
```

FE notes:

- `points[].date` là ISO timestamp của bucket.
- FE nên format label theo `interval`.
- Nếu không có data, `points` có thể là array rỗng; chart cần empty state.
- BE hiện chỉ trả bucket có data, FE tự fill bucket 0 nếu chart cần đường liên tục.

### GET /api/v1/analytics/dashboard/warranties

Dùng cho: warranty status chart và expiring soon panel.

Query:

```ts
type WarrantiesQuery = Pick<AnalyticsRangeQuery, "from" | "to">;
```

Response:

```ts
type AnalyticsDashboardWarranties = {
  total: number;
  byStatus: Array<{
    status: "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
    count: number;
  }>;
  expiringSoon: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  activatedInRange: number;
};
```

FE notes:

- `expiringSoon.next30Days` đã bao gồm các warranty trong `next7Days`.
- `activatedInRange` dùng `startDate` trong selected range.

### GET /api/v1/analytics/dashboard/products

Dùng cho: product inventory summary.

Response:

```ts
type AnalyticsDashboardProducts = {
  total: number;
  byStatus: Array<{
    status: "ACTIVE" | "INACTIVE" | "DELETED";
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
```

FE notes:

- `total` không tính product đã soft delete.
- `byCategory.categoryName = null` nghĩa là product chưa gắn category động hoặc category không còn tồn tại.
- `topBrands` tối đa 10 brand.

### GET /api/v1/analytics/dashboard/recent-activity

Dùng cho: activity feed bên dashboard.

Query:

```ts
type AnalyticsRecentActivityQuery = {
  limit?: number; // 1..50, default 10
};
```

Response:

```ts
type AnalyticsRecentActivity = {
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
```

FE notes:

- Sort đã là mới nhất trước.
- Với `entity.type = "warranty_claim"`, link tới `/warranty-claims/:id`.
- Với `entity.type = "warranty"`, hiện chưa có warranty detail page riêng; FE có thể link tới `/warranties` hoặc product detail nếu sau này BE trả thêm `productId`.

## Service FE gợi ý

Tạo service riêng:

```txt
apps/admin/src/services/analytics/analytics.service.ts
```

Ví dụ shape:

```ts
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
} from "@repo/shared/types";
import { adminHttpClient } from "@/src/lib/admin-http-client";

const BASE_PATH = "/analytics/dashboard";

export const analyticsService = {
  overview(params?: AnalyticsRangeQuery) {
    return adminHttpClient.get<AnalyticsDashboardOverview>(
      `${BASE_PATH}/overview`,
      { params },
    );
  },
  claims(params?: AnalyticsRangeQuery) {
    return adminHttpClient.get<AnalyticsDashboardClaims>(
      `${BASE_PATH}/claims`,
      {
        params,
      },
    );
  },
  trends(params?: AnalyticsTrendsQuery) {
    return adminHttpClient.get<AnalyticsDashboardTrends>(
      `${BASE_PATH}/trends`,
      { params },
    );
  },
  warranties(params?: AnalyticsRangeQuery) {
    return adminHttpClient.get<AnalyticsDashboardWarranties>(
      `${BASE_PATH}/warranties`,
      { params },
    );
  },
  products() {
    return adminHttpClient.get<AnalyticsDashboardProducts>(
      `${BASE_PATH}/products`,
    );
  },
  recentActivity(params?: AnalyticsRecentActivityQuery) {
    return adminHttpClient.get<AnalyticsRecentActivity>(
      `${BASE_PATH}/recent-activity`,
      { params },
    );
  },
};
```

## React Query keys gợi ý

```ts
export const analyticsQueryKeys = {
  all: ["analytics"] as const,
  overview: (params?: AnalyticsRangeQuery) =>
    [...analyticsQueryKeys.all, "overview", params] as const,
  claims: (params?: AnalyticsRangeQuery) =>
    [...analyticsQueryKeys.all, "claims", params] as const,
  trends: (params?: AnalyticsTrendsQuery) =>
    [...analyticsQueryKeys.all, "trends", params] as const,
  warranties: (params?: AnalyticsRangeQuery) =>
    [...analyticsQueryKeys.all, "warranties", params] as const,
  products: () => [...analyticsQueryKeys.all, "products"] as const,
  recentActivity: (params?: AnalyticsRecentActivityQuery) =>
    [...analyticsQueryKeys.all, "recent-activity", params] as const,
};
```

## Dashboard FE flow gợi ý

Màn `/dashboard` nên load song song:

- `overview`
- `claims`
- `trends`
- `recentActivity`

Các widget nâng cao có thể lazy-load:

- `warranties`
- `products`

UI states:

- Loading: skeleton cho từng card/chart/feed, không block cả page nếu một request chậm.
- Error: từng widget show state lỗi riêng, vẫn render các widget khác nếu có data.
- Empty: chart/feed có empty state riêng.
- Permission denied: route-level guard bằng `DASHBOARD_VIEW`, không gọi API nếu thiếu permission.

## Không nên làm ở FE

- Không tự tính KPI bằng cách gọi list endpoint nhiều lần.
- Không hardcode enum label trong component; gom mapping trong constants/i18n.
- Không assume đủ bucket chart; nếu cần bucket 0, fill ở helper chart.
- Không dùng endpoint `warranty-claims/metrics/summary` cho dashboard tổng mới, trừ khi màn claim directory cần metrics riêng.

## Change log

- 2026-07-15: thêm Analytics API cho Admin Dashboard.
