import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_claim_priority,
  warranty_claim_status,
} from '@prisma/client';
import type { WarrantyClaimAssignmentStatus } from '@repo/shared';

export const WARRANTY_CLAIM_ASSET_ENTITY_TYPE = 'warranty_claim';

function getServiceCenterFilter(filters: {
  assignmentStatus?: WarrantyClaimAssignmentStatus;
  serviceCenterId?: string;
}): Prisma.StringNullableFilter | string | null | undefined {
  if (filters.serviceCenterId) return filters.serviceCenterId;
  if (filters.assignmentStatus === 'UNASSIGNED') return null;
  if (filters.assignmentStatus === 'ASSIGNED') return { not: null };

  return undefined;
}

const claimInclude = {
  product: true,
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

@Injectable()
export class WarrantyClaimsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findWarrantyProductByCode(warrantyCode: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty_code: warrantyCode,
        deleted_at: null,
      },
      include: {
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  findById(id: string) {
    return this.prismaService.warrantyClaim.findUnique({
      where: { id },
      include: claimInclude,
    });
  }

  findByClaimCode(claimCode: string) {
    return this.prismaService.warrantyClaim.findUnique({
      where: { claim_code: claimCode },
      include: claimInclude,
    });
  }

  findLastClaimCode(prefix: string) {
    return this.prismaService.warrantyClaim.findFirst({
      where: {
        claim_code: {
          startsWith: prefix,
        },
      },
      orderBy: { claim_code: 'desc' },
      select: { claim_code: true },
    });
  }

  findByWarrantyCode(warrantyCode: string) {
    return this.prismaService.warrantyClaim.findMany({
      where: { warranty_code: warrantyCode },
      include: claimInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  list(filters: ListWarrantyClaimsDto) {
    const search = filters.search?.trim();
    const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
    const claimCode = filters.claimCode?.trim().toUpperCase();
    const { page, limit, skip, take } = normalizePagination(filters);
    const dueFilter: Prisma.DateTimeNullableFilter = {
      gte: filters.dueFrom ? new Date(filters.dueFrom) : undefined,
      lte: filters.dueTo ? new Date(filters.dueTo) : undefined,
    };
    const hasDueFilter = Boolean(dueFilter.gte || dueFilter.lte);
    const createdAtFilter: Prisma.DateTimeFilter = {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };
    const hasCreatedAtFilter = Boolean(
      createdAtFilter.gte || createdAtFilter.lte,
    );
    const terminalStatuses = [
      warranty_claim_status.COMPLETED,
      warranty_claim_status.REJECTED,
      warranty_claim_status.CANCELLED,
    ];
    const statusFilter =
      filters.isOverdue === 'true'
        ? (filters.status ?? { notIn: terminalStatuses })
        : filters.status;
    const sortMap = {
      claimCode: 'claim_code',
      warrantyCode: 'warranty_code',
      status: 'status',
      priority: 'priority',
      dueAt: 'due_at',
      submittedAt: 'submitted_at',
      resolvedAt: 'resolved_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<
      string,
      keyof Prisma.WarrantyClaimOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.WarrantyClaimWhereInput = {
      status: statusFilter,
      priority: filters.priority,
      warranty_code: warrantyCode,
      claim_code: claimCode,
      service_center_id: getServiceCenterFilter(filters),
      created_at: hasCreatedAtFilter ? createdAtFilter : undefined,
      due_at:
        filters.isOverdue === 'true'
          ? { lt: new Date() }
          : hasDueFilter
            ? dueFilter
            : undefined,
      OR: search
        ? [
            { claim_code: { contains: search, mode: 'insensitive' } },
            { warranty_code: { contains: search, mode: 'insensitive' } },
            { requester_name: { contains: search, mode: 'insensitive' } },
            { requester_phone: { contains: search, mode: 'insensitive' } },
            { issue_title: { contains: search, mode: 'insensitive' } },
            {
              product: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          ]
        : undefined,
    };
    const orderBy: Prisma.WarrantyClaimOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warrantyClaim.findMany({
          where,
          include: claimInclude,
          orderBy,
          skip,
          take,
        }),
        tx.warrantyClaim.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  create(data: Prisma.WarrantyClaimCreateInput) {
    return this.prismaService.warrantyClaim.create({
      data,
      include: claimInclude,
    });
  }

  updateStatus(
    id: string,
    status: warranty_claim_status,
    resolvedAt?: Date | null,
  ) {
    return this.prismaService.warrantyClaim.update({
      where: { id },
      data: {
        status,
        resolved_at: resolvedAt,
      },
      include: claimInclude,
    });
  }

  updateStatusWithHistory(input: {
    id: string;
    fromStatus: warranty_claim_status;
    toStatus: warranty_claim_status;
    resolvedAt?: Date | null;
    slaBreachedAt?: Date | null;
    note?: string;
    changedByUserId?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.warrantyClaim.update({
        where: { id: input.id },
        data: {
          status: input.toStatus,
          resolved_at: input.resolvedAt,
          sla_breached_at: input.slaBreachedAt,
        },
      });
      await tx.warrantyClaimStatusHistory.create({
        data: {
          warranty_claim_id: input.id,
          from_status: input.fromStatus,
          to_status: input.toStatus,
          note: input.note,
          changed_by_user_id: input.changedByUserId,
        },
      });

      return tx.warrantyClaim.findUniqueOrThrow({
        where: { id: input.id },
        include: claimInclude,
      });
    });
  }

  findActiveServiceCenterById(id: string) {
    return this.prismaService.serviceCenter.findFirst({
      where: {
        id,
        is_active: true,
      },
    });
  }

  assignServiceCenter(input: {
    id: string;
    fromServiceCenterId: string | null;
    serviceCenterId: string;
    note?: string;
    changedByUserId?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const centers = await tx.serviceCenter.findMany({
        where: {
          id: {
            in: [input.fromServiceCenterId, input.serviceCenterId].filter(
              (id): id is string => Boolean(id),
            ),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      const centerNames = new Map(
        centers.map((center) => [center.id, center.name]),
      );
      const toServiceCenterName = centerNames.get(input.serviceCenterId);

      if (!toServiceCenterName) {
        throw new Error('Service center not found during assignment');
      }

      await tx.warrantyClaim.update({
        where: { id: input.id },
        data: {
          service_center_id: input.serviceCenterId,
        },
      });
      await tx.warrantyClaimServiceCenterHistory.create({
        data: {
          warranty_claim_id: input.id,
          from_service_center_id: input.fromServiceCenterId,
          from_service_center_name: input.fromServiceCenterId
            ? centerNames.get(input.fromServiceCenterId)
            : null,
          to_service_center_id: input.serviceCenterId,
          to_service_center_name: toServiceCenterName,
          note: input.note,
          changed_by_user_id: input.changedByUserId,
        },
      });

      return tx.warrantyClaim.findUniqueOrThrow({
        where: { id: input.id },
        include: claimInclude,
      });
    });
  }

  updatePriority(input: {
    id: string;
    priority?: warranty_claim_priority;
    dueAt?: Date | null;
    slaBreachedAt?: Date | null;
  }) {
    return this.prismaService.warrantyClaim.update({
      where: { id: input.id },
      data: {
        priority: input.priority,
        due_at: input.dueAt,
        sla_breached_at: input.slaBreachedAt,
      },
      include: claimInclude,
    });
  }

  findAssetById(assetId: string) {
    return this.prismaService.asset.findFirst({
      where: {
        id: assetId,
        is_deleted: false,
      },
    });
  }

  linkAssetToClaim(input: {
    claimId: string;
    assetId: string;
    note?: string;
    linkedByUserId?: string;
  }) {
    return this.prismaService.assetLink.upsert({
      where: {
        asset_id_entity_id_entity_type: {
          asset_id: input.assetId,
          entity_id: input.claimId,
          entity_type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
        },
      },
      create: {
        asset_id: input.assetId,
        entity_id: input.claimId,
        entity_type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
      },
      update: {},
      include: { asset: true },
    });
  }

  listClaimAssets(claimId: string) {
    return this.prismaService.assetLink.findMany({
      where: {
        entity_id: claimId,
        entity_type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
        asset: { is_deleted: false },
      },
      include: { asset: true },
      orderBy: { created_at: 'desc' },
    });
  }

  findClaimAssetLink(claimId: string, assetId: string) {
    return this.prismaService.assetLink.findUnique({
      where: {
        asset_id_entity_id_entity_type: {
          asset_id: assetId,
          entity_id: claimId,
          entity_type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
        },
      },
    });
  }

  unlinkAssetFromClaim(claimId: string, assetId: string) {
    return this.prismaService.assetLink.deleteMany({
      where: {
        asset_id: assetId,
        entity_id: claimId,
        entity_type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
      },
    });
  }

  async getMetrics(filters: {
    assignmentStatus?: WarrantyClaimAssignmentStatus;
    dateFrom?: string;
    dateTo?: string;
    serviceCenterId?: string;
  }) {
    const where: Prisma.WarrantyClaimWhereInput = {
      service_center_id: getServiceCenterFilter(filters),
      created_at:
        filters.dateFrom || filters.dateTo
          ? {
              gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
              lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
            }
          : undefined,
    };
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const terminalStatuses = [
      warranty_claim_status.COMPLETED,
      warranty_claim_status.REJECTED,
      warranty_claim_status.CANCELLED,
    ];

    const [
      total,
      createdToday,
      createdThisMonth,
      overdue,
      byStatus,
      byPriority,
      byServiceCenter,
      resolvedClaims,
    ] = await Promise.all([
      this.prismaService.warrantyClaim.count({ where }),
      this.prismaService.warrantyClaim.count({
        where: { ...where, created_at: { gte: startOfToday } },
      }),
      this.prismaService.warrantyClaim.count({
        where: { ...where, created_at: { gte: startOfMonth } },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...where,
          due_at: { lt: now },
          status: { notIn: terminalStatuses },
        },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['priority'],
        where,
        _count: { _all: true },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['service_center_id'],
        where,
        _count: { _all: true },
      }),
      this.prismaService.warrantyClaim.findMany({
        where: {
          ...where,
          resolved_at: { not: null },
        },
        select: {
          created_at: true,
          resolved_at: true,
        },
      }),
    ]);

    const averageResolutionHours =
      resolvedClaims.length === 0
        ? null
        : resolvedClaims.reduce((totalHours, claim) => {
            const resolvedAt = claim.resolved_at ?? claim.created_at;
            return (
              totalHours +
              (resolvedAt.getTime() - claim.created_at.getTime()) / 3_600_000
            );
          }, 0) / resolvedClaims.length;

    return {
      total,
      createdToday,
      createdThisMonth,
      overdue,
      byStatus,
      byPriority,
      byServiceCenter,
      averageResolutionHours,
    };
  }
}
