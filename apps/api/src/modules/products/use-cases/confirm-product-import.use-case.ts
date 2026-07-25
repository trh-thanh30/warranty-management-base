import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import {
  prepareProductImportRows,
  PreparedProductImportRow,
} from '@/modules/products/excel/product-import.validator';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

@Injectable()
export class ConfirmProductImportUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
  ) {}

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
          row.productCode?.trim() ||
          (await this.generateProductCodeUseCase.execute(new Date(), tx));
        const product = await tx.product.create({
          data: {
            product_code: productCode,
            template: { connect: { id: row.templateId } },
            serial_number: this.blankToNull(row.serialNumber),
            display_name: this.blankToNull(row.displayName),
            status: row.status ?? product_status.ACTIVE,
            metadata: this.toMetadata(row),
            warranty: {
              create: {
                warranty_code: null,
                duration_months: row.templateWarrantyDurationMonths,
                start_date: null,
                end_date: null,
                status: warranty_status.DRAFT,
                terms: row.templateWarrantyTerms,
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
      template: { connect: { id: row.templateId } },
      display_name: this.blankToNull(row.displayName),
      status: row.status,
      serial_number: this.blankToNull(row.serialNumber),
      metadata: this.toMetadata(row),
    };
  }

  private async upsertDraftWarranty(
    tx: Prisma.TransactionClient,
    productId: string,
    row: PreparedProductImportRow,
  ) {
    await tx.warranty.upsert({
      where: { product_id: productId },
      create: {
        product_id: productId,
        warranty_code: null,
        duration_months: row.templateWarrantyDurationMonths,
        status: warranty_status.DRAFT,
        terms: row.templateWarrantyTerms,
      },
      update: {},
    });
  }

  private toMetadata(row: PreparedProductImportRow) {
    const installationPosition = this.blankToNull(row.installationPosition);
    const metadata: Record<string, string> = {};

    if (installationPosition) {
      metadata.installationPosition = installationPosition;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  private blankToNull(value: string | null | undefined) {
    return value?.trim() || null;
  }
}
