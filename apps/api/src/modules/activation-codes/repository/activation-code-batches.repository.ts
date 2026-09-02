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

export type CreateActivationCodeBatchRecord = {
  batchCode: string;
  sourceProductId: string;
  productSku: string;
  productName: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  warrantyDurationMonths: number;
  warrantyMethod: warranty_method;
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
          include: { codes: { select: { status: true } } },
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

          return {
            id: batch.id,
            batchCode: batch.batch_code,
            productSku: batch.product_sku,
            productName: batch.product_name,
            quantity: batch.quantity,
            expiresAt: batch.expires_at,
            createdAt: batch.created_at,
            statusCounts,
          };
        }),
        { page, limit, total },
      );
    });
  }

  async revokeBatch(id: string) {
    const batch = await this.prismaService.activationCodeBatch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!batch) return null;
    const result = await this.prismaService.activationCode.updateMany({
      where: { batch_id: id, status: activation_code_status.AVAILABLE },
      data: { status: activation_code_status.REVOKED, revoked_at: new Date() },
    });
    return { batchId: id, revokedCount: result.count };
  }

  create(input: CreateActivationCodeBatchRecord) {
    return this.prismaService.activationCodeBatch.create({
      data: {
        batch_code: input.batchCode,
        source_product: { connect: { id: input.sourceProductId } },
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
  ) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const batch = await this.prismaService.activationCodeBatch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });
    if (!batch) return null;
    const search = filters.search?.trim();
    const where: Prisma.ActivationCodeWhereInput = {
      batch_id: batchId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(search ? { code_hash: this.crypto.hash(search) } : {}),
    };
    const [rows, total] = await this.prismaService.$transaction([
      this.prismaService.activationCode.findMany({
        where,
        orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
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
          maskedCode: `${plaintext.slice(0, 8)}••••`,
          ...(row.status === activation_code_status.AVAILABLE
            ? { copyCode: plaintext }
            : {}),
          status: row.status,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          activatedAt: row.activated_at,
          revokedAt: row.revoked_at,
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
    productId: string,
    filters: { page?: number; limit?: number; search?: string },
  ) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const search = filters.search?.trim();
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { product_code: true },
    });
    if (!product) return paginate([], { page, limit, total: 0 });
    const baseWhere: Prisma.ActivationCodeWhereInput = {
      OR: [
        { batch: { source_product_id: productId } },
        { batch: { product_sku: product.product_code } },
      ],
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
        select: { batch_code: true, product_name: true, product_sku: true },
      },
      expires_at: true,
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
          maskedCode: `${plaintext.slice(0, 8)}••••`,
          batchCode: row.batch.batch_code,
          productName: row.batch.product_name,
          productSku: row.batch.product_sku,
          expiresAt: row.expires_at,
          status,
          selectable: status === activation_code_status.AVAILABLE,
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
        include: { batch: { select: { product_sku: true } } },
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
        include: { batch: { select: { product_sku: true } } },
      });
      if (
        !replacement ||
        replacement.status !== activation_code_status.AVAILABLE ||
        replacement.batch.product_sku !== expired.batch.product_sku
      ) {
        return { kind: 'INVALID_REPLACEMENT' as const };
      }
      await tx.activationCode.update({
        where: { id: expired.id },
        data: {
          status: activation_code_status.REPLACED,
          replaced_by_id: replacement.id,
        },
      });
      return { kind: 'REPLACED' as const, replacementId: replacement.id };
    });
  }

  private mask(ciphertext: string) {
    return `${this.crypto.decrypt(ciphertext).slice(0, 8)}••••`;
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
      where: { id, status: activation_code_status.AVAILABLE },
      data: { status: activation_code_status.REVOKED, revoked_at: new Date() },
    });
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
