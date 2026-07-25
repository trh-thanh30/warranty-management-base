import { PrismaService } from '@/database/prisma/prisma.service';
import { AnalyticsDateRange } from '@/modules/analytics/analytics.utils';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_activation_request_status,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';

type TrendMetric =
  | 'claims'
  | 'claim_completed'
  | 'claim_overdue'
  | 'warranties'
  | 'warranty_activated'
  | 'warranty_activation_requests'
  | 'products'
  | 'customers';

type TrendInterval = 'day' | 'week' | 'month';

const TREND_INTERVAL_SQL: Record<TrendInterval, Prisma.Sql> = {
  day: Prisma.sql`'day'`,
  week: Prisma.sql`'week'`,
  month: Prisma.sql`'month'`,
};

type TrendRow = {
  bucket: Date;
  value: bigint | number;
};

const TERMINAL_CLAIM_STATUSES = [
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
];

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOverview(input: {
    range: AnalyticsDateRange;
    previousRange: AnalyticsDateRange;
    serviceCenterId?: string;
  }) {
    const claimWhere = this.buildClaimWhere(input.range, input.serviceCenterId);
    const previousClaimWhere = this.buildClaimWhere(
      input.previousRange,
      input.serviceCenterId,
    );
    const now = new Date();

    const [
      customers,
      products,
      activeWarranties,
      expiredWarranties,
      openClaims,
      overdueClaims,
      completedClaims,
      serviceCenters,
      customersInRange,
      customersInPreviousRange,
      productsInRange,
      productsInPreviousRange,
      claimsInRange,
      claimsInPreviousRange,
      completedClaimsInRange,
      completedClaimsInPreviousRange,
    ] = await this.prismaService.$transaction([
      this.prismaService.customer.count(),
      this.prismaService.product.count({ where: { deleted_at: null } }),
      this.prismaService.warranty.count({
        where: { status: warranty_status.ACTIVE },
      }),
      this.prismaService.warranty.count({
        where: { status: warranty_status.EXPIRED },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          service_center_id: input.serviceCenterId,
          status: { notIn: TERMINAL_CLAIM_STATUSES },
        },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          service_center_id: input.serviceCenterId,
          status: { notIn: TERMINAL_CLAIM_STATUSES },
          due_at: { lt: now },
        },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          service_center_id: input.serviceCenterId,
          status: warranty_claim_status.COMPLETED,
          resolved_at: {
            gte: input.range.from,
            lte: input.range.to,
          },
        },
      }),
      this.prismaService.serviceCenter.count({ where: { is_active: true } }),
      this.prismaService.customer.count({
        where: { created_at: this.dateRangeFilter(input.range) },
      }),
      this.prismaService.customer.count({
        where: { created_at: this.dateRangeFilter(input.previousRange) },
      }),
      this.prismaService.product.count({
        where: {
          deleted_at: null,
          created_at: this.dateRangeFilter(input.range),
        },
      }),
      this.prismaService.product.count({
        where: {
          deleted_at: null,
          created_at: this.dateRangeFilter(input.previousRange),
        },
      }),
      this.prismaService.warrantyClaim.count({ where: claimWhere }),
      this.prismaService.warrantyClaim.count({ where: previousClaimWhere }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...claimWhere,
          status: warranty_claim_status.COMPLETED,
        },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...previousClaimWhere,
          status: warranty_claim_status.COMPLETED,
        },
      }),
    ]);

    return {
      customers,
      products,
      activeWarranties,
      expiredWarranties,
      openClaims,
      overdueClaims,
      completedClaims,
      serviceCenters,
      deltas: {
        customers: customersInRange - customersInPreviousRange,
        products: productsInRange - productsInPreviousRange,
        claims: claimsInRange - claimsInPreviousRange,
        completedClaims:
          completedClaimsInRange - completedClaimsInPreviousRange,
      },
    };
  }

  async getClaims(input: {
    range: AnalyticsDateRange;
    serviceCenterId?: string;
  }) {
    const where = this.buildClaimWhere(input.range, input.serviceCenterId);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      createdToday,
      createdThisMonth,
      overdue,
      byStatus,
      byPriority,
      byServiceCenter,
      resolutionRows,
    ] = await this.prismaService.$transaction([
      this.prismaService.warrantyClaim.count({ where }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...where,
          created_at: { gte: today, lte: now },
        },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...where,
          created_at: { gte: monthStart, lte: now },
        },
      }),
      this.prismaService.warrantyClaim.count({
        where: {
          ...where,
          status: { notIn: TERMINAL_CLAIM_STATUSES },
          due_at: { lt: now },
        },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['status'],
        where,
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['priority'],
        where,
        orderBy: { priority: 'asc' },
        _count: { _all: true },
      }),
      this.prismaService.warrantyClaim.groupBy({
        by: ['service_center_id'],
        where,
        orderBy: { service_center_id: 'asc' },
        _count: { _all: true },
      }),
      this.prismaService.$queryRaw<Array<{ average_hours: number | null }>>`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - submitted_at)) / 3600)::float AS average_hours
        FROM warranty_claim
        WHERE resolved_at IS NOT NULL
          AND created_at >= ${input.range.from}
          AND created_at <= ${input.range.to}
          AND (${input.serviceCenterId ?? null}::uuid IS NULL OR service_center_id = ${input.serviceCenterId ?? null}::uuid)
      `,
    ]);

    const serviceCenterIds = byServiceCenter
      .map((item) => item.service_center_id)
      .filter((id): id is string => Boolean(id));
    const serviceCenters = serviceCenterIds.length
      ? await this.prismaService.serviceCenter.findMany({
          where: { id: { in: serviceCenterIds } },
          select: { id: true, name: true },
        })
      : [];
    const serviceCenterNames = new Map(
      serviceCenters.map((center) => [center.id, center.name]),
    );

    return {
      total,
      createdToday,
      createdThisMonth,
      overdue,
      averageResolutionHours: resolutionRows[0]?.average_hours ?? null,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: this.getGroupCount(item),
      })),
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: this.getGroupCount(item),
      })),
      byServiceCenter: byServiceCenter.map((item) => ({
        serviceCenterId: item.service_center_id,
        serviceCenterName: item.service_center_id
          ? (serviceCenterNames.get(item.service_center_id) ?? null)
          : null,
        count: this.getGroupCount(item),
      })),
    };
  }

  async getTrends(input: {
    metric: TrendMetric;
    interval: TrendInterval;
    range: AnalyticsDateRange;
    serviceCenterId?: string;
  }) {
    const interval = TREND_INTERVAL_SQL[input.interval];
    const serviceCenterId = input.serviceCenterId ?? null;
    let rows: TrendRow[];
    let breakdownRows: Array<{
      bucket: Date;
      key: string;
      value: bigint | number;
    }> = [];

    switch (input.metric) {
      case 'claims':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, created_at) AS bucket, COUNT(*) AS value
          FROM warranty_claim
          WHERE created_at >= ${input.range.from}
            AND created_at <= ${input.range.to}
            AND (${serviceCenterId}::uuid IS NULL OR service_center_id = ${serviceCenterId}::uuid)
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
      case 'claim_completed':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, resolved_at) AS bucket, COUNT(*) AS value
          FROM warranty_claim
          WHERE resolved_at IS NOT NULL
            AND resolved_at >= ${input.range.from}
            AND resolved_at <= ${input.range.to}
            AND status = 'COMPLETED'::warranty_claim_status
            AND (${serviceCenterId}::uuid IS NULL OR service_center_id = ${serviceCenterId}::uuid)
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
      case 'claim_overdue':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, due_at) AS bucket, COUNT(*) AS value
          FROM warranty_claim
          WHERE due_at IS NOT NULL
            AND due_at >= ${input.range.from}
            AND due_at <= ${input.range.to}
            AND due_at < NOW()
            AND status NOT IN ('COMPLETED'::warranty_claim_status, 'REJECTED'::warranty_claim_status, 'CANCELLED'::warranty_claim_status)
            AND (${serviceCenterId}::uuid IS NULL OR service_center_id = ${serviceCenterId}::uuid)
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
      case 'warranties':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, created_at) AS bucket, COUNT(*) AS value
          FROM warranty
          WHERE created_at >= ${input.range.from}
            AND created_at <= ${input.range.to}
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
      case 'warranty_activated':
        breakdownRows = await this.prismaService.$queryRaw`
          SELECT date_trunc(${interval}, start_date) AS bucket,
            status::text AS key,
            COUNT(*) AS value
          FROM warranty
          WHERE start_date IS NOT NULL
            AND start_date >= ${input.range.from}
            AND start_date <= ${input.range.to}
          GROUP BY bucket, status
          ORDER BY bucket ASC, status ASC
        `;
        rows = breakdownRows.reduce<TrendRow[]>((result, row) => {
          const existing = result.find(
            (item) => item.bucket.getTime() === row.bucket.getTime(),
          );
          if (existing) {
            existing.value = Number(existing.value) + Number(row.value);
          } else {
            result.push({ bucket: row.bucket, value: row.value });
          }
          return result;
        }, []);
        break;
      case 'warranty_activation_requests':
        breakdownRows = await this.prismaService.$queryRaw`
          SELECT date_trunc(${interval}, created_at) AS bucket,
            status::text AS key,
            COUNT(*) AS value
          FROM warranty_activation_request
          WHERE created_at >= ${input.range.from}
            AND created_at <= ${input.range.to}
          GROUP BY bucket, status
          ORDER BY bucket ASC, status ASC
        `;
        rows = breakdownRows.reduce<TrendRow[]>((result, row) => {
          const existing = result.find(
            (item) => item.bucket.getTime() === row.bucket.getTime(),
          );
          if (existing) {
            existing.value = Number(existing.value) + Number(row.value);
          } else {
            result.push({ bucket: row.bucket, value: row.value });
          }
          return result;
        }, []);
        break;
      case 'products':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, created_at) AS bucket, COUNT(*) AS value
          FROM product
          WHERE created_at >= ${input.range.from}
            AND created_at <= ${input.range.to}
            AND deleted_at IS NULL
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
      case 'customers':
        rows = await this.prismaService.$queryRaw<TrendRow[]>`
          SELECT date_trunc(${interval}, created_at) AS bucket, COUNT(*) AS value
          FROM customer
          WHERE created_at >= ${input.range.from}
            AND created_at <= ${input.range.to}
          GROUP BY bucket
          ORDER BY bucket ASC
        `;
        break;
    }

    return rows.map((row) => {
      const date = row.bucket.toISOString();
      const breakdown = breakdownRows
        .filter((item) => item.bucket.getTime() === row.bucket.getTime())
        .map((item) => ({ key: item.key, value: Number(item.value) }));

      return {
        date,
        value: Number(row.value),
        ...(breakdown.length > 0 ? { breakdown } : {}),
      };
    });
  }

  async getWarranties(input: { range: AnalyticsDateRange }) {
    const now = new Date();
    const next7Days = this.addDays(now, 7);
    const next30Days = this.addDays(now, 30);
    const next90Days = this.addDays(now, 90);

    const [
      total,
      byStatus,
      expiringNext7Days,
      expiringNext30Days,
      expiringNext90Days,
      activatedInRange,
    ] = await this.prismaService.$transaction([
      this.prismaService.warranty.count(),
      this.prismaService.warranty.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
      this.countExpiringWarranties(now, next7Days),
      this.countExpiringWarranties(now, next30Days),
      this.countExpiringWarranties(now, next90Days),
      this.prismaService.warranty.count({
        where: {
          status: warranty_status.ACTIVE,
          start_date: this.dateRangeFilter(input.range),
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: this.getGroupCount(item),
      })),
      expiringSoon: {
        next7Days: expiringNext7Days,
        next30Days: expiringNext30Days,
        next90Days: expiringNext90Days,
      },
      activatedInRange,
    };
  }

  async getActivationRequests(input: { range: AnalyticsDateRange }) {
    const createdInRangeWhere = {
      created_at: this.dateRangeFilter(input.range),
    };

    const [total, createdInRange, byStatus, bySource] =
      await this.prismaService.$transaction([
        this.prismaService.warrantyActivationRequest.count({
          where: createdInRangeWhere,
        }),
        this.prismaService.warrantyActivationRequest.count({
          where: createdInRangeWhere,
        }),
        this.prismaService.warrantyActivationRequest.groupBy({
          by: ['status'],
          where: createdInRangeWhere,
          orderBy: { status: 'asc' },
          _count: { _all: true },
        }),
        this.prismaService.warrantyActivationRequest.groupBy({
          by: ['source'],
          where: createdInRangeWhere,
          orderBy: { source: 'asc' },
          _count: { _all: true },
        }),
      ]);
    const statusCounts = new Map(
      byStatus.map((item) => [item.status, this.getGroupCount(item)]),
    );

    return {
      total,
      createdInRange,
      pending:
        statusCounts.get(warranty_activation_request_status.PENDING) ?? 0,
      approved:
        statusCounts.get(warranty_activation_request_status.APPROVED) ?? 0,
      rejected:
        statusCounts.get(warranty_activation_request_status.REJECTED) ?? 0,
      activated:
        statusCounts.get(warranty_activation_request_status.ACTIVATED) ?? 0,
      cancelled:
        statusCounts.get(warranty_activation_request_status.CANCELLED) ?? 0,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: this.getGroupCount(item),
      })),
      bySource: bySource.map((item) => ({
        source: item.source,
        count: this.getGroupCount(item),
      })),
    };
  }

  async getProducts() {
    const [total, byStatus, byCategory, topBrands] =
      await this.prismaService.$transaction([
        this.prismaService.product.count({ where: { deleted_at: null } }),
        this.prismaService.product.groupBy({
          by: ['status'],
          where: { deleted_at: null },
          orderBy: { status: 'asc' },
          _count: { _all: true },
        }),
        this.prismaService.product.groupBy({
          by: ['category_id'],
          where: { deleted_at: null },
          orderBy: { category_id: 'asc' },
          _count: { _all: true },
        }),
        this.prismaService.product.groupBy({
          by: ['brand'],
          where: {
            deleted_at: null,
            brand: { not: null },
          },
          _count: { _all: true },
          orderBy: { _count: { brand: 'desc' } },
          take: 10,
        }),
      ]);

    const categoryIds = byCategory
      .map((item) => item.category_id)
      .filter((id): id is string => Boolean(id));
    const categories = categoryIds.length
      ? await this.prismaService.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
    const categoryNames = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: this.getGroupCount(item),
      })),
      byCategory: byCategory.map((item) => ({
        categoryId: item.category_id,
        categoryName: item.category_id
          ? (categoryNames.get(item.category_id) ?? null)
          : null,
        count: this.getGroupCount(item),
      })),
      topBrands: topBrands.map((item) => ({
        brand: item.brand ?? 'Unknown',
        count: this.getGroupCount(item),
      })),
    };
  }

  async getRecentActivity(limit: number) {
    const [claims, statusChanges, activatedWarranties] =
      await this.prismaService.$transaction([
        this.prismaService.warrantyClaim.findMany({
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            claim_code: true,
            issue_title: true,
            created_at: true,
          },
        }),
        this.prismaService.warrantyClaimStatusHistory.findMany({
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            warranty_claim: {
              select: {
                id: true,
                claim_code: true,
                issue_title: true,
              },
            },
          },
        }),
        this.prismaService.warranty.findMany({
          take: limit,
          where: {
            status: warranty_status.ACTIVE,
            start_date: { not: null },
          },
          orderBy: { start_date: 'desc' },
          select: {
            id: true,
            warranty_code: true,
            start_date: true,
            created_at: true,
            product_id: true,
          },
        }),
      ]);

    return [
      ...claims.map((claim) => ({
        id: `claim-created-${claim.id}`,
        type: 'CLAIM_CREATED' as const,
        title: `Claim ${claim.claim_code} created`,
        description: claim.issue_title,
        occurredAt: claim.created_at,
        entity: {
          type: 'warranty_claim' as const,
          id: claim.id,
          code: claim.claim_code,
        },
      })),
      ...statusChanges.map((change) => ({
        id: `claim-status-${change.id}`,
        type: 'CLAIM_STATUS_CHANGED' as const,
        title: `Claim ${change.warranty_claim.claim_code} moved to ${change.to_status}`,
        description: change.note,
        occurredAt: change.created_at,
        entity: {
          type: 'warranty_claim' as const,
          id: change.warranty_claim.id,
          code: change.warranty_claim.claim_code,
        },
      })),
      ...activatedWarranties.map((warranty) => ({
        id: `warranty-activated-${warranty.id}`,
        type: 'WARRANTY_ACTIVATED' as const,
        title: `Warranty ${warranty.warranty_code} activated`,
        description: null,
        occurredAt: warranty.start_date ?? warranty.created_at,
        entity: {
          type: 'warranty' as const,
          id: warranty.id,
          code: warranty.warranty_code,
        },
      })),
    ]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit);
  }

  private buildClaimWhere(
    range: AnalyticsDateRange,
    serviceCenterId?: string,
  ): Prisma.WarrantyClaimWhereInput {
    return {
      service_center_id: serviceCenterId,
      created_at: this.dateRangeFilter(range),
    };
  }

  private dateRangeFilter(range: AnalyticsDateRange) {
    return {
      gte: range.from,
      lte: range.to,
    };
  }

  private countExpiringWarranties(from: Date, to: Date) {
    return this.prismaService.warranty.count({
      where: {
        status: warranty_status.ACTIVE,
        end_date: {
          gte: from,
          lte: to,
        },
      },
    });
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private getGroupCount(item: { _count?: true | { _all?: number } }) {
    if (!item._count || item._count === true) {
      return 0;
    }

    return item._count._all ?? 0;
  }
}
