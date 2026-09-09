import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import type {
  ActivationCodeReport,
  ActivationCodeReportFilters,
  ActivationCodeReportQueryResult,
  ActivationCodeReportRow,
} from '@/modules/activation-codes/activation-code-reporting.types';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { Injectable } from '@nestjs/common';
import {
  activation_code_status,
  Prisma,
  warranty_method,
} from '@prisma/client';
import type { ActivationCodeBatchRevokeScope } from '@repo/shared';

export class ProductActivationCodeReplacementConflictError extends Error {}

export type CreateActivationCodeBatchRecord = {
  batchCode: string;
  batchName: string;
  sourceProductId?: string;
  productSku?: string;
  productName?: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  warrantyDurationMonths?: number;
  warrantyMethod?: warranty_method;
  warrantyTerms: string | null;
  quantity: number;
  expiresAt: Date;
  createdById: string;
  codes: Array<{ codeHash: string; codeCiphertext: string }>;
};

@Injectable()
export class ActivationCodeBatchesRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly crypto: ActivationCodeCryptoService,
  ) {}

  list(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: activation_code_status;
  }) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const search = filters.search?.trim();
    const where: Prisma.ActivationCodeBatchWhereInput = {
      ...(search
        ? {
            OR: [
              { batch_name: { contains: search, mode: 'insensitive' } },
              { batch_code: { contains: search, mode: 'insensitive' } },
              { product_sku: { contains: search, mode: 'insensitive' } },
              { product_name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters.status
        ? { codes: { some: { status: filters.status } } }
        : {}),
    };

    return this.prismaService.$transaction(async (tx) => {
      const [batches, total] = await Promise.all([
        tx.activationCodeBatch.findMany({
          where,
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          skip,
          take,
          include: { codes: { select: { status: true, product_id: true } } },
        }),
        tx.activationCodeBatch.count({ where }),
      ]);

      return paginate(
        batches.map((batch) => {
          const statusCounts = batch.codes.reduce<
            Partial<Record<activation_code_status, number>>
          >((counts, code) => {
            counts[code.status] = (counts[code.status] ?? 0) + 1;
            return counts;
          }, {});
          const assignedCount = batch.codes.reduce(
            (count, code) => count + (code.product_id ? 1 : 0),
            0,
          );

          return {
            id: batch.id,
            batchCode: batch.batch_code,
            batchName: batch.batch_name,
            productSku: batch.product_sku,
            productName: batch.product_name,
            quantity: batch.quantity,
            expiresAt: batch.expires_at,
            createdAt: batch.created_at,
            assignedCount,
            statusCounts,
          };
        }),
        { page, limit, total },
      );
    });
  }

  async revokeBatch(id: string, scope: ActivationCodeBatchRevokeScope) {
    return this.prismaService.$transaction(async (tx) => {
      const batch = await tx.activationCodeBatch.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!batch) return null;

      const result = await tx.activationCode.updateMany({
        where: this.buildRevocableWhere({
          batch_id: id,
          ...(scope === 'UNASSIGNED_ONLY' ? { product_id: null } : {}),
        }),
        data: {
          status: activation_code_status.REVOKED,
          revoked_at: new Date(),
          ...(scope === 'ALL_REVOCABLE' ? { product_id: null } : {}),
        },
      });
      return { batchId: id, scope, revokedCount: result.count };
    });
  }

  async getRevokePreview(id: string) {
    return this.prismaService.$transaction(async (tx) => {
      const batch = await tx.activationCodeBatch.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!batch) return null;

      const revocableWhere = this.buildRevocableWhere({
        batch_id: id,
      });
      const [
        totalCount,
        unassignedRevocableCount,
        assignedRevocableCount,
        requestProtectedCount,
        activatedProtectedCount,
      ] = await Promise.all([
        tx.activationCode.count({ where: { batch_id: id } }),
        tx.activationCode.count({
          where: { ...revocableWhere, product_id: null },
        }),
        tx.activationCode.count({
          where: { ...revocableWhere, product_id: { not: null } },
        }),
        tx.activationCode.count({
          where: {
            batch_id: id,
            status: activation_code_status.AVAILABLE,
            warranty: { is: null },
            OR: [{ request: { isNot: null } }, { request_items: { some: {} } }],
          },
        }),
        tx.activationCode.count({
          where: {
            batch_id: id,
            OR: [
              { status: activation_code_status.ACTIVATED },
              { warranty: { isNot: null } },
            ],
          },
        }),
      ]);

      return {
        batchId: id,
        totalCount,
        unassignedRevocableCount,
        assignedRevocableCount,
        requestProtectedCount,
        activatedProtectedCount,
      };
    });
  }

  async updateBatchName(id: string, batchName: string) {
    const existing = await this.prismaService.activationCodeBatch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return null;
    return this.prismaService.activationCodeBatch.update({
      where: { id },
      data: { batch_name: batchName },
      select: { id: true, batch_code: true, batch_name: true },
    });
  }

  create(input: CreateActivationCodeBatchRecord) {
    return this.prismaService.activationCodeBatch.create({
      data: {
        batch_code: input.batchCode,
        batch_name: input.batchName,
        source_product: input.sourceProductId
          ? { connect: { id: input.sourceProductId } }
          : undefined,
        product_sku: input.productSku,
        product_name: input.productName,
        brand: input.brand,
        model: input.model,
        model_year: input.modelYear,
        warranty_duration_months: input.warrantyDurationMonths,
        warranty_method: input.warrantyMethod,
        warranty_terms: input.warrantyTerms,
        quantity: input.quantity,
        expires_at: input.expiresAt,
        created_by: { connect: { id: input.createdById } },
        codes: {
          createMany: {
            data: input.codes.map((code) => ({
              code_hash: code.codeHash,
              code_ciphertext: code.codeCiphertext,
              expires_at: input.expiresAt,
              status: activation_code_status.AVAILABLE,
            })),
          },
        },
      } satisfies Prisma.ActivationCodeBatchCreateInput,
    });
  }

  findWithCodes(id: string) {
    return this.prismaService.activationCodeBatch.findUnique({
      where: { id },
      include: {
        codes: {
          where: {
            status: activation_code_status.AVAILABLE,
            expires_at: { gt: new Date() },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });
  }

  async listCodes(
    batchId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: activation_code_status;
    },
    scope: 'batch' | 'product' = 'batch',
  ) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const entity =
      scope === 'batch'
        ? await this.prismaService.activationCodeBatch.findUnique({
            where: { id: batchId },
            select: { id: true },
          })
        : await this.prismaService.product.findUnique({
            where: { id: batchId },
            select: { id: true },
          });
    if (!entity) return null;
    const search = filters.search?.trim();
    const where: Prisma.ActivationCodeWhereInput = {
      ...(scope === 'batch' ? { batch_id: batchId } : { product_id: batchId }),
      ...(filters.status ? { status: filters.status } : {}),
      ...(search ? { code_hash: this.crypto.hash(search) } : {}),
    };
    const [rows, total] = await this.prismaService.$transaction([
      this.prismaService.activationCode.findMany({
        where,
        orderBy:
          scope === 'batch'
            ? [{ product_id: 'asc' }, { created_at: 'asc' }, { id: 'asc' }]
            : [{ created_at: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          batch: { select: { product_name: true, product_sku: true } },
          code_ciphertext: true,
          status: true,
          created_at: true,
          expires_at: true,
          activated_at: true,
          revoked_at: true,
          product: {
            select: {
              id: true,
              product_code: true,
              display_name: true,
            },
          },
          replaced_by: {
            select: { id: true, code_ciphertext: true, status: true },
          },
          replaces: {
            select: { id: true, code_ciphertext: true, status: true },
          },
        },
      }),
      this.prismaService.activationCode.count({ where }),
    ]);

    return paginate(
      rows.map((row) => {
        const plaintext = this.crypto.decrypt(row.code_ciphertext);
        return {
          id: row.id,
          productName: row.batch.product_name,
          productSku: row.batch.product_sku,
          // The admin activation-code workspace is an operational screen;
          // staff must be able to read and copy the complete code for every
          // lifecycle state, including revoked/replaced history.
          maskedCode: plaintext,
          copyCode: plaintext,
          status: row.status,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          activatedAt: row.activated_at,
          revokedAt: row.revoked_at,
          assignedProduct: row.product
            ? {
                id: row.product.id,
                productCode: row.product.product_code,
                displayName: row.product.display_name,
                name: row.product.display_name ?? row.product.product_code,
              }
            : null,
          replacedBy: row.replaced_by
            ? {
                id: row.replaced_by.id,
                maskedCode: this.mask(row.replaced_by.code_ciphertext),
                status: row.replaced_by.status,
              }
            : null,
          replaces: row.replaces
            ? {
                id: row.replaces.id,
                maskedCode: this.mask(row.replaces.code_ciphertext),
                status: row.replaces.status,
              }
            : null,
        };
      }),
      { page, limit, total },
    );
  }

  async listAvailableByProduct(
    productId: string | undefined,
    filters: {
      batchId?: string;
      page?: number;
      limit?: number;
      search?: string;
      assignment?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
    },
  ) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const search = filters.search?.trim();
    const product = productId
      ? await this.prismaService.product.findUnique({
          where: { id: productId },
          select: { id: true },
        })
      : null;
    if (productId && !product) return paginate([], { page, limit, total: 0 });
    const baseWhere: Prisma.ActivationCodeWhereInput = {
      ...(filters.batchId ? { batch_id: filters.batchId } : {}),
      ...(product ? { product_id: product.id } : {}),
      ...(!product && filters.assignment === 'ASSIGNED'
        ? { product_id: { not: null } }
        : {}),
      ...(!product && filters.assignment === 'UNASSIGNED'
        ? { product_id: null }
        : {}),
      ...(search ? { code_hash: this.crypto.hash(search) } : {}),
    };
    const availableWhere: Prisma.ActivationCodeWhereInput = {
      AND: [
        baseWhere,
        {
          status: activation_code_status.AVAILABLE,
          expires_at: { gt: new Date() },
        },
      ],
    };
    const unavailableWhere: Prisma.ActivationCodeWhereInput = {
      AND: [
        baseWhere,
        {
          NOT: {
            status: activation_code_status.AVAILABLE,
            expires_at: { gt: new Date() },
          },
        },
      ],
    };
    const select = {
      id: true,
      code_ciphertext: true,
      status: true,
      batch: {
        select: {
          batch_code: true,
          batch_name: true,
          product_name: true,
          product_sku: true,
        },
      },
      expires_at: true,
      product: {
        select: {
          id: true,
          product_code: true,
          display_name: true,
        },
      },
    } satisfies Prisma.ActivationCodeSelect;
    const [availableTotal, total] = await this.prismaService.$transaction([
      this.prismaService.activationCode.count({ where: availableWhere }),
      this.prismaService.activationCode.count({ where: baseWhere }),
    ]);
    const availableSkip = Math.min(skip, availableTotal);
    const availableTake = Math.min(
      take,
      Math.max(availableTotal - availableSkip, 0),
    );
    const unavailableSkip = Math.max(skip - availableTotal, 0);
    const unavailableTake = take - availableTake;
    const [availableRows, unavailableRows] = await Promise.all([
      availableTake > 0
        ? this.prismaService.activationCode.findMany({
            where: availableWhere,
            orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
            skip: availableSkip,
            take: availableTake,
            select,
          })
        : Promise.resolve([]),
      unavailableTake > 0
        ? this.prismaService.activationCode.findMany({
            where: unavailableWhere,
            orderBy: [{ status: 'asc' }, { created_at: 'asc' }, { id: 'asc' }],
            skip: unavailableSkip,
            take: unavailableTake,
            select,
          })
        : Promise.resolve([]),
    ]);
    const rows = [...availableRows, ...unavailableRows];
    const now = Date.now();
    return paginate(
      rows.map((row) => {
        const plaintext = this.crypto.decrypt(row.code_ciphertext);
        const status =
          row.status === activation_code_status.AVAILABLE &&
          row.expires_at.getTime() <= now
            ? activation_code_status.EXPIRED
            : row.status;
        return {
          id: row.id,
          maskedCode: plaintext,
          copyCode: plaintext,
          batchCode: row.batch.batch_code,
          batchName: row.batch.batch_name,
          productName: row.batch.product_name,
          productSku: row.batch.product_sku,
          expiresAt: row.expires_at,
          status,
          selectable: status === activation_code_status.AVAILABLE,
          assignedProduct: row.product
            ? {
                id: row.product.id,
                productCode: row.product.product_code,
                displayName: row.product.display_name,
                name: row.product.display_name ?? row.product.product_code,
              }
            : null,
        };
      }),
      { page, limit, total },
    );
  }

  async replaceExpiredCode(expiredId: string, replacementCode: string) {
    const replacementHash = this.crypto.hash(replacementCode);
    return this.prismaService.$transaction(async (tx) => {
      const expired = await tx.activationCode.findUnique({
        where: { id: expiredId },
      });
      if (!expired) return { kind: 'NOT_FOUND' as const };
      if (
        expired.status !== activation_code_status.EXPIRED ||
        expired.replaced_by_id
      ) {
        return { kind: 'NOT_REPLACEABLE' as const };
      }
      const replacement = await tx.activationCode.findUnique({
        where: { code_hash: replacementHash },
      });
      if (
        !replacement ||
        replacement.status !== activation_code_status.AVAILABLE ||
        replacement.expires_at <= new Date() ||
        replacement.product_id
      ) {
        return { kind: 'INVALID_REPLACEMENT' as const };
      }
      await tx.activationCode.update({
        where: { id: expired.id },
        data: {
          status: activation_code_status.REPLACED,
          replaced_by_id: replacement.id,
          product_id: null,
        },
      });
      if (expired.product_id) {
        await tx.activationCode.update({
          where: { id: replacement.id },
          data: { product_id: expired.product_id },
        });
      }
      return { kind: 'REPLACED' as const, replacementId: replacement.id };
    });
  }

  private mask(ciphertext: string) {
    return this.crypto.decrypt(ciphertext);
  }

  findAvailableByHash(codeHash: string) {
    return this.prismaService.activationCode.findFirst({
      where: {
        code_hash: codeHash,
        status: activation_code_status.AVAILABLE,
      },
      include: { batch: true },
    });
  }

  findAvailableById(id: string) {
    return this.prismaService.activationCode.findFirst({
      where: { id, status: activation_code_status.AVAILABLE },
      include: { batch: true },
    });
  }

  findSelectableForPendingRequest(id: string, requestId: string) {
    return this.prismaService.activationCode.findFirst({
      where: {
        id,
        OR: [
          { status: activation_code_status.AVAILABLE },
          {
            status: activation_code_status.PENDING_APPROVAL,
            OR: [
              { request: { is: { id: requestId } } },
              { request_items: { some: { request_id: requestId } } },
            ],
          },
        ],
      },
      include: { batch: true },
    });
  }

  expireIfNeeded(id: string, now = new Date()) {
    return this.prismaService.activationCode.updateMany({
      where: {
        id,
        status: activation_code_status.AVAILABLE,
        expires_at: { lte: now },
      },
      data: { status: activation_code_status.EXPIRED },
    });
  }

  findAssignmentProduct(id: string) {
    return this.prismaService.product.findUnique({
      where: { id },
      select: {
        id: true,
        product_code: true,
        display_name: true,
        status: true,
        deleted_at: true,
        warranty_duration_months: true,
        category_ref: { select: { activation_code_enabled: true } },
      },
    });
  }

  findCodesForAssignment(ids: string[]) {
    return this.prismaService.activationCode.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        status: true,
        expires_at: true,
        product_id: true,
        request: { select: { id: true } },
        request_items: { select: { id: true }, take: 1 },
        warranty: { select: { id: true } },
      },
    });
  }

  assignProduct(ids: string[], productId: string, now: Date) {
    return this.prismaService.activationCode.updateMany({
      where: {
        id: { in: ids },
        status: activation_code_status.AVAILABLE,
        expires_at: { gt: now },
        request: { is: null },
        request_items: { none: {} },
        warranty: { is: null },
      },
      data: { product_id: productId },
    });
  }

  replaceProductAssignment(input: {
    currentActivationCodeId: string;
    replacementActivationCodeId: string;
    productId: string;
    now: Date;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const released = await tx.activationCode.updateMany({
        where: {
          id: input.currentActivationCodeId,
          product_id: input.productId,
          status: activation_code_status.AVAILABLE,
          expires_at: { gt: input.now },
          request: { is: null },
          request_items: { none: {} },
          warranty: { is: null },
        },
        data: { product_id: null },
      });
      if (released.count !== 1) {
        throw new ProductActivationCodeReplacementConflictError();
      }

      const assigned = await tx.activationCode.updateMany({
        where: {
          id: input.replacementActivationCodeId,
          product_id: null,
          status: activation_code_status.AVAILABLE,
          expires_at: { gt: input.now },
          request: { is: null },
          request_items: { none: {} },
          warranty: { is: null },
        },
        data: { product_id: input.productId },
      });
      if (assigned.count !== 1) {
        throw new ProductActivationCodeReplacementConflictError();
      }
    });
  }

  unassignProduct(ids: string[], now: Date) {
    return this.prismaService.activationCode.updateMany({
      where: {
        id: { in: ids },
        status: activation_code_status.AVAILABLE,
        expires_at: { gt: now },
        request: { is: null },
        request_items: { none: {} },
        warranty: { is: null },
      },
      data: { product_id: null },
    });
  }

  async findExpiredAvailableIds(now: Date, take: number): Promise<string[]> {
    const codes = await this.prismaService.activationCode.findMany({
      where: {
        status: activation_code_status.AVAILABLE,
        expires_at: { lte: now },
      },
      orderBy: [{ expires_at: 'asc' }, { id: 'asc' }],
      select: { id: true },
      take,
    });

    return codes.map((code) => code.id);
  }

  expireAvailableIds(ids: string[], now: Date) {
    return this.prismaService.activationCode.updateMany({
      where: {
        id: { in: ids },
        status: activation_code_status.AVAILABLE,
        expires_at: { lte: now },
      },
      data: { status: activation_code_status.EXPIRED },
    });
  }

  async getReport(
    filters: ActivationCodeReportFilters,
  ): Promise<ActivationCodeReportQueryResult> {
    const where = this.buildReportWhere(filters);
    const [total, grouped, codes] = await Promise.all([
      this.prismaService.activationCode.count({ where }),
      this.prismaService.activationCode.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prismaService.activationCode.findMany({
        where: { ...where, request: { isNot: null } },
        select: {
          status: true,
          request: {
            select: { province_code: true, province_name: true },
          },
        },
      }),
    ]);

    const byStatus = grouped.map((item) => ({
      status: item.status,
      count: item._count._all,
    }));
    const provinces = new Map<
      string,
      ActivationCodeReport['byProvince'][number]
    >();
    for (const code of codes) {
      const provinceCode = code.request?.province_code;
      const provinceName = code.request?.province_name;
      if (!provinceCode || !provinceName) continue;
      const key = provinceCode;
      const current = provinces.get(key) ?? {
        provinceCode,
        provinceName,
        total: 0,
        byStatus: {},
      };
      current.total += 1;
      current.byStatus[code.status] = (current.byStatus[code.status] ?? 0) + 1;
      provinces.set(key, current);
    }

    return {
      total,
      byStatus,
      byProvince: [...provinces.values()].sort((a, b) =>
        a.provinceName.localeCompare(b.provinceName, 'vi'),
      ),
    };
  }

  async listReportRows(
    filters: ActivationCodeReportFilters,
  ): Promise<ActivationCodeReportRow[]> {
    const rows = await this.prismaService.activationCode.findMany({
      where: this.buildReportWhere(filters),
      orderBy: [{ created_at: 'desc' }, { id: 'asc' }],
      take: 50000,
      select: {
        id: true,
        status: true,
        created_at: true,
        expires_at: true,
        activated_at: true,
        batch: {
          select: { batch_code: true, product_sku: true, product_name: true },
        },
        request: {
          select: {
            province_code: true,
            province_name: true,
            dealer: { select: { dealer_code: true, name: true } },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      batchCode: row.batch.batch_code,
      productSku: row.batch.product_sku,
      productName: row.batch.product_name,
      status: row.status,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      activatedAt: row.activated_at,
      provinceCode: row.request?.province_code ?? null,
      provinceName: row.request?.province_name ?? null,
      dealerCode: row.request?.dealer?.dealer_code ?? null,
      dealerName: row.request?.dealer?.name ?? null,
    }));
  }

  revoke(id: string) {
    return this.prismaService.activationCode.updateMany({
      where: this.buildRevocableWhere({ id }),
      data: {
        status: activation_code_status.REVOKED,
        revoked_at: new Date(),
        product_id: null,
      },
    });
  }

  private buildRevocableWhere(
    where: Prisma.ActivationCodeWhereInput,
  ): Prisma.ActivationCodeWhereInput {
    return {
      ...where,
      status: activation_code_status.AVAILABLE,
      request: { is: null },
      request_items: { none: {} },
      warranty: { is: null },
    };
  }

  private buildReportWhere(
    filters: ActivationCodeReportFilters,
  ): Prisma.ActivationCodeWhereInput {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) createdAt.lte = new Date(filters.dateTo);
    return {
      ...(Object.keys(createdAt).length ? { created_at: createdAt } : {}),
      ...(filters.batchId ? { batch_id: filters.batchId } : {}),
      ...(filters.provinceCode
        ? { request: { province_code: filters.provinceCode } }
        : {}),
    };
  }
}
