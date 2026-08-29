import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { Prisma, warranty_claim_status } from '@prisma/client';
import type { WarrantyClaimAssignmentStatus } from '@repo/shared';

const TERMINAL_STATUSES = [
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
];

const SORT_FIELDS: Partial<
  Record<string, keyof Prisma.WarrantyClaimOrderByWithRelationInput>
> = {
  claimCode: 'claim_code',
  warrantyCode: 'warranty_code',
  status: 'status',
  priority: 'priority',
  dueAt: 'due_at',
  submittedAt: 'submitted_at',
  resolvedAt: 'resolved_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

type ServiceCenterFilters = {
  assignmentStatus?: WarrantyClaimAssignmentStatus;
  serviceCenterId?: string;
};

export type WarrantyClaimMetricsFilters = ServiceCenterFilters & {
  dateFrom?: string;
  dateTo?: string;
};

export const warrantyClaimInclude = {
  product: {
    include: {
      category_ref: true,
    },
  },
  warranty: true,
  customer: true,
  service_center: true,
  status_history: {
    include: {
      changed_by: true,
    },
    orderBy: { created_at: 'asc' },
  },
  service_center_history: {
    include: {
      changed_by: true,
    },
    orderBy: { created_at: 'asc' },
  },
} satisfies Prisma.WarrantyClaimInclude;

function getServiceCenterFilter(
  filters: ServiceCenterFilters,
): Prisma.StringNullableFilter | string | null | undefined {
  if (filters.serviceCenterId) return filters.serviceCenterId;
  if (filters.assignmentStatus === 'UNASSIGNED') return null;
  if (filters.assignmentStatus === 'ASSIGNED') return { not: null };

  return undefined;
}

function getDateFilter(
  dateFrom?: string,
  dateTo?: string,
): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;

  return {
    gte: dateFrom ? new Date(dateFrom) : undefined,
    lte: dateTo ? new Date(dateTo) : undefined,
  };
}

function buildWarrantyClaimOrderBy(
  sortBy?: keyof Prisma.WarrantyClaimOrderByWithRelationInput,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.WarrantyClaimOrderByWithRelationInput[] {
  if (!sortBy) return [{ created_at: 'desc' }, { id: 'desc' }];

  const orderBy = [
    { [sortBy]: sortOrder },
  ] as Prisma.WarrantyClaimOrderByWithRelationInput[];

  if (sortBy !== 'created_at') orderBy.push({ created_at: 'desc' });

  orderBy.push({ id: 'desc' });
  return orderBy;
}

export function buildWarrantyClaimListQuery(
  filters: ListWarrantyClaimsDto,
  now = new Date(),
) {
  const search = filters.search?.trim();
  const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
  const claimCode = filters.claimCode?.trim().toUpperCase();
  const dueFilter = getDateFilter(filters.dueFrom, filters.dueTo);
  const createdAtFilter = getDateFilter(filters.dateFrom, filters.dateTo);
  const statusFilter =
    filters.isOverdue === 'true'
      ? (filters.status ?? { notIn: TERMINAL_STATUSES })
      : filters.status;
  const sortBy = filters.sortBy ? SORT_FIELDS[filters.sortBy] : undefined;
  const where: Prisma.WarrantyClaimWhereInput = {
    status: statusFilter,
    priority: filters.priority,
    warranty_code: warrantyCode,
    claim_code: claimCode,
    service_center_id: getServiceCenterFilter(filters),
    created_at: createdAtFilter,
    due_at: filters.isOverdue === 'true' ? { lt: now } : dueFilter,
    OR: search
      ? [
          { claim_code: { contains: search, mode: 'insensitive' } },
          { warranty_code: { contains: search, mode: 'insensitive' } },
          { requester_name: { contains: search, mode: 'insensitive' } },
          { requester_phone: { contains: search, mode: 'insensitive' } },
          { issue_title: { contains: search, mode: 'insensitive' } },
          {
            product: {
              display_name: { contains: search, mode: 'insensitive' },
            },
          },
        ]
      : undefined,
  };
  const orderBy = buildWarrantyClaimOrderBy(sortBy, filters.sortOrder);

  return { orderBy, where };
}

export function buildWarrantyClaimMetricsWhere(
  filters: WarrantyClaimMetricsFilters,
): Prisma.WarrantyClaimWhereInput {
  return {
    service_center_id: getServiceCenterFilter(filters),
    created_at: getDateFilter(filters.dateFrom, filters.dateTo),
  };
}

export function buildWarrantyClaimOverdueWhere(
  where: Prisma.WarrantyClaimWhereInput,
  now: Date,
): Prisma.WarrantyClaimWhereInput {
  return {
    ...where,
    due_at: { lt: now },
    status: { notIn: TERMINAL_STATUSES },
  };
}
