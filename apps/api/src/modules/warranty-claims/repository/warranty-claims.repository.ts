import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { calculateAverageResolutionHours } from '@/modules/warranty-claims/mappers/warranty-claim-metrics.mapper';
import {
  buildWarrantyClaimListQuery,
  buildWarrantyClaimMetricsWhere,
  buildWarrantyClaimOverdueWhere,
  type WarrantyClaimMetricsFilters,
  warrantyClaimInclude,
} from '@/modules/warranty-claims/repository/warranty-claims.repository.queries';
import { WARRANTY_CLAIM_ASSET_ENTITY_TYPE } from '@/modules/warranty-claims/warranty-claims.constants';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_claim_priority,
  warranty_claim_status,
} from '@prisma/client';

@Injectable()
export class WarrantyClaimsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findWarrantyProductByCode(warrantyCode: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty: { warranty_code: warrantyCode },
        deleted_at: null,
      },
      include: {
        category_ref: true,
        warranty: true,
        template: { include: { category_ref: true } },
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
      include: warrantyClaimInclude,
    });
  }

  findByClaimCode(claimCode: string) {
    return this.prismaService.warrantyClaim.findUnique({
      where: { claim_code: claimCode },
      include: warrantyClaimInclude,
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
      include: warrantyClaimInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  list(filters: ListWarrantyClaimsDto) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const { orderBy, where } = buildWarrantyClaimListQuery(filters);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warrantyClaim.findMany({
          where,
          include: warrantyClaimInclude,
          orderBy,
          skip,
          take,
        }),
        tx.warrantyClaim.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: ListWarrantyClaimsDto) {
    const { orderBy, where } = buildWarrantyClaimListQuery(filters);

    return this.prismaService.warrantyClaim.findMany({
      where,
      include: warrantyClaimInclude,
      orderBy,
      take: 5000,
    });
  }

  create(data: Prisma.WarrantyClaimCreateInput) {
    return this.prismaService.warrantyClaim.create({
      data,
      include: warrantyClaimInclude,
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
      include: warrantyClaimInclude,
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
        include: warrantyClaimInclude,
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
        include: warrantyClaimInclude,
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
      include: warrantyClaimInclude,
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

  async getMetrics(filters: WarrantyClaimMetricsFilters) {
    const where = buildWarrantyClaimMetricsWhere(filters);
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
        where: buildWarrantyClaimOverdueWhere(where, now),
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
      calculateAverageResolutionHours(resolvedClaims);

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
