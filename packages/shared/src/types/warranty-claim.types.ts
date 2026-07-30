import type { CustomerSummary } from "./customer.types.ts";
import type { PaginationQuery } from "./pagination.types.ts";
import type { ProductSummary } from "./product.types.ts";
import type { ServiceCenterSummary } from "./service-center.types.ts";
import type { WarrantySummary } from "./warranty.types.ts";

export type WarrantyClaimProductSummary = Pick<
  ProductSummary,
  | "id"
  | "productCode"
  | "warrantyCode"
  | "serialNumber"
  | "name"
  | "categoryId"
  | "categoryRef"
  | "brand"
  | "model"
  | "modelYear"
  | "status"
>;

export type WarrantyClaimWarrantySummary = Pick<
  WarrantySummary,
  | "id"
  | "warrantyCode"
  | "startDate"
  | "endDate"
  | "durationMonths"
  | "coverageLimitAmount"
  | "maxClaimCount"
  | "maxAmountPerClaim"
  | "status"
  | "terms"
>;

export type WarrantyClaimStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "CANCELLED";

export type WarrantyClaimPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type PublicWarrantyClaimStatusTimelineItem = {
  type: "STATUS_CHANGED";
  status: WarrantyClaimStatus;
  createdAt: string;
};

export type PublicWarrantyClaimServiceCenterTimelineItem = {
  type: "SERVICE_CENTER_ASSIGNED" | "SERVICE_CENTER_CHANGED";
  serviceCenterName: string;
  createdAt: string;
};

export type PublicWarrantyClaimTimelineItem =
  | PublicWarrantyClaimStatusTimelineItem
  | PublicWarrantyClaimServiceCenterTimelineItem;

export const WARRANTY_CLAIM_ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "UNASSIGNED",
] as const;

export type WarrantyClaimAssignmentStatus =
  (typeof WARRANTY_CLAIM_ASSIGNMENT_STATUSES)[number];

export type WarrantyClaimStatusHistorySummary = {
  id: string;
  fromStatus: WarrantyClaimStatus | null;
  toStatus: WarrantyClaimStatus;
  note: string | null;
  changedByUserId: string | null;
  changedBy: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  } | null;
  createdAt: string;
};

export type WarrantyClaimStatusTimelineItem =
  WarrantyClaimStatusHistorySummary & {
    type: "STATUS_CHANGED";
  };

export type WarrantyClaimServiceCenterTimelineItem = {
  id: string;
  type: "SERVICE_CENTER_ASSIGNED" | "SERVICE_CENTER_CHANGED";
  fromServiceCenter: {
    id: string | null;
    name: string;
  } | null;
  toServiceCenter: {
    id: string;
    name: string;
  };
  reason: string | null;
  changedByUserId: string | null;
  changedBy: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  } | null;
  createdAt: string;
};

export type WarrantyClaimTimelineItem =
  | WarrantyClaimStatusTimelineItem
  | WarrantyClaimServiceCenterTimelineItem;

export type WarrantyClaimAttachmentSummary = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  accessType: string;
  uploadedById: string | null;
  createdAt: string;
};

export type WarrantyClaimSummary = {
  id: string;
  claimCode: string;
  warrantyId: string;
  productId: string;
  customerId: string | null;
  warrantyCode: string;
  requesterName: string | null;
  requesterPhone: string | null;
  issueTitle: string;
  issueDetail: string | null;
  status: WarrantyClaimStatus;
  priority: WarrantyClaimPriority;
  dueAt: string | null;
  slaBreachedAt: string | null;
  metadata: Record<string, unknown> | null;
  submittedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: WarrantyClaimProductSummary | null;
  warranty: WarrantyClaimWarrantySummary | null;
  customer: CustomerSummary | null;
  serviceCenter: ServiceCenterSummary | null;
  statusHistory: WarrantyClaimStatusHistorySummary[];
  attachments: WarrantyClaimAttachmentSummary[];
};

export type PublicWarrantyClaimSummary = Pick<
  WarrantyClaimSummary,
  | "claimCode"
  | "warrantyCode"
  | "issueTitle"
  | "status"
  | "priority"
  | "dueAt"
  | "submittedAt"
  | "resolvedAt"
> & {
  timeline: PublicWarrantyClaimTimelineItem[];
  product: Pick<ProductSummary, "name" | "brand" | "model"> | null;
  serviceCenter: Pick<
    ServiceCenterSummary,
    "name" | "phone" | "email" | "province" | "district" | "address"
  > | null;
};

export type WarrantyClaimSortBy =
  | "claimCode"
  | "warrantyCode"
  | "status"
  | "priority"
  | "dueAt"
  | "submittedAt"
  | "resolvedAt"
  | "createdAt"
  | "updatedAt";

export type ListWarrantyClaimsQuery = PaginationQuery & {
  assignmentStatus?: WarrantyClaimAssignmentStatus;
  claimCode?: string;
  dateFrom?: string;
  dateTo?: string;
  dueFrom?: string;
  dueTo?: string;
  isOverdue?: "true" | "false";
  priority?: WarrantyClaimPriority;
  search?: string;
  serviceCenterId?: string;
  sortBy?: WarrantyClaimSortBy;
  status?: WarrantyClaimStatus;
  warrantyCode?: string;
};

export type WarrantyClaimMetrics = {
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
    count: number;
  }>;
};

export type WarrantyClaimMetricsQuery = {
  assignmentStatus?: WarrantyClaimAssignmentStatus;
  dateFrom?: string;
  dateTo?: string;
  serviceCenterId?: string;
};

export type CreateWarrantyClaimBody = {
  warrantyCode: string;
  requesterName: string;
  requesterPhone: string;
  issueTitle: string;
  issueDetail?: string;
};

export type UpdateWarrantyClaimStatusBody = {
  status: WarrantyClaimStatus;
  note?: string;
};

export type AssignWarrantyClaimServiceCenterBody = {
  serviceCenterId: string;
  note?: string;
};

export type UpdateWarrantyClaimPriorityBody = {
  priority?: WarrantyClaimPriority;
  dueAt?: string;
};
