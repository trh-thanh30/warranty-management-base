import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import {
  prepareProductImportRows,
  PreparedProductImportRow,
} from '@/modules/products/excel/product-import.validator';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

@Injectable()
export class ConfirmProductImportUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(dto: ConfirmProductImportDto) {
    if (dto.rows.length === 0) {
      throw new BadRequestError('Import rows are required');
    }

    const { errors, rows } = await prepareProductImportRows(
      this.prismaService,
      dto.rows.map((data, index) => ({ data, rowNumber: index + 1 })),
    );

    if (errors.length > 0) {
      return {
        created: 0,
        updated: 0,
        deactivated: 0,
        errors,
      };
    }

    return this.prismaService.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      const importedProductIds: string[] = [];

      for (const row of rows) {
        if (row.action === 'update' && row.existingProductId) {
          const product = await tx.product.update({
            where: { id: row.existingProductId },
            data: this.toProductUpdateInput(row),
            select: { id: true },
          });
          await this.upsertDraftWarranty(tx, product.id, row);
          importedProductIds.push(product.id);
          updated += 1;
          continue;
        }

        const productCode =
          row.productCode?.trim() || (await this.generateProductCode(tx));
        const product = await tx.product.create({
          data: {
            product_code: productCode,
            warranty_code: null,
            serial_number: this.blankToNull(row.serialNumber),
            name: row.name.trim(),
            category: row.category,
            brand: this.blankToNull(row.brand),
            model: this.blankToNull(row.model),
            manufacture_year: row.manufactureYear ?? null,
            description: this.blankToNull(row.description),
            status: row.status ?? product_status.ACTIVE,
            category_ref: row.categoryId
              ? { connect: { id: row.categoryId } }
              : undefined,
            metadata: this.toMetadata(row),
            warranty: {
              create: {
                warranty_code: null,
                duration_months: row.warrantyDurationMonths ?? 36,
                start_date: null,
                end_date: null,
                status: warranty_status.DRAFT,
                terms: this.blankToNull(row.warrantyTerms),
              },
            },
          },
          select: { id: true },
        });
        importedProductIds.push(product.id);
        created += 1;
      }

      const deactivated =
        dto.mode === 'replace'
          ? (
              await tx.product.updateMany({
                where: {
                  deleted_at: null,
                  id: { notIn: importedProductIds },
                  status: { not: product_status.INACTIVE },
                },
                data: { status: product_status.INACTIVE },
              })
            ).count
          : 0;

      return {
        created,
        updated,
        deactivated,
        errors: [],
      };
    });
  }

  private toProductUpdateInput(
    row: PreparedProductImportRow,
  ): Prisma.ProductUpdateInput {
    return {
      name: row.name.trim(),
      category: row.category,
      brand: this.blankToNull(row.brand),
      model: this.blankToNull(row.model),
      manufacture_year: row.manufactureYear ?? null,
      description: this.blankToNull(row.description),
      status: row.status,
      serial_number: this.blankToNull(row.serialNumber),
      category_ref: row.categoryId
        ? { connect: { id: row.categoryId } }
        : row.categoryCode
          ? undefined
          : { disconnect: true },
      metadata: this.toMetadata(row),
    };
  }

  private async upsertDraftWarranty(
    tx: Prisma.TransactionClient,
    productId: string,
    row: PreparedProductImportRow,
  ) {
    if (!row.warrantyDurationMonths && !row.warrantyTerms) {
      return;
    }

    await tx.warranty.upsert({
      where: { product_id: productId },
      create: {
        product_id: productId,
        warranty_code: null,
        duration_months: row.warrantyDurationMonths ?? 36,
        status: warranty_status.DRAFT,
        terms: this.blankToNull(row.warrantyTerms),
      },
      update: {
        duration_months: row.warrantyDurationMonths ?? undefined,
        terms:
          row.warrantyTerms === undefined
            ? undefined
            : this.blankToNull(row.warrantyTerms),
      },
    });
  }

  private toMetadata(row: PreparedProductImportRow) {
    const imageUrl = this.blankToNull(row.imageUrl);
    return imageUrl
      ? {
          excelImageUrl: imageUrl,
        }
      : undefined;
  }

  private blankToNull(value: string | null | undefined) {
    return value?.trim() || null;
  }

  private async generateProductCode(tx: Prisma.TransactionClient) {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `PRD-${year}-${suffix}`;
      const existing = await tx.product.findUnique({
        where: { product_code: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestError('Could not generate a unique product code');
  }
}
