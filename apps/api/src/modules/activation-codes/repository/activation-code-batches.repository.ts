import { PrismaService } from '@/database/prisma/prisma.service';
import type {
  ActivationCodeReport,
  ActivationCodeReportFilters,
  ActivationCodeReportQueryResult,
  ActivationCodeReportRow,
} from '@/modules/activation-codes/activation-code-reporting.types';
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
  constructor(private readonly prismaService: PrismaService) {}

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

  findAvailableByHash(codeHash: string) {
    return this.prismaService.activationCode.findFirst({
      where: {
        code_hash: codeHash,
        status: activation_code_status.AVAILABLE,
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
