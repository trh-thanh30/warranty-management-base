import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import {
  prepareProductImportRows,
  PreparedProductImportRow,
} from '@/modules/products/excel/product-import.validator';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';
import { toSlug } from '@/common/helpers/string.util';

@Injectable()
export class ConfirmProductImportUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
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
      const importDate = new Date();
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
          await this.ensureDraftWarrantyCode(tx, product.id, row, importDate);
          importedProductIds.push(product.id);
          updated += 1;
          continue;
        }

        const productCode =
          row.productCode?.trim() ||
          (await this.generateProductCodeUseCase.execute(importDate, tx));
        const warrantyCode = await this.resolveWarrantyCode(
          tx,
          row,
          importDate,
        );
        const product = await tx.product.create({
          data: {
            product_code: productCode,
            category_ref: { connect: { id: row.categoryId } },
            catalogue_name: row.displayName.trim(),
            catalogue_sku: productCode,
            catalogue_slug: this.toCatalogueSlug(row.displayName, productCode),
            catalogue_brand: this.blankToNull(row.brand),
            catalogue_model: this.blankToNull(row.model),
            catalogue_model_year: row.modelYear,
            serial_number: this.blankToNull(row.serialNumber),
            display_name: row.displayName.trim(),
            status: row.status ?? product_status.ACTIVE,
            metadata: this.toMetadata(row),
            warranty: {
              create: {
                warranty_code: warrantyCode,
                duration_months: row.warrantyDurationMonths,
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
      category_ref: { connect: { id: row.categoryId } },
      catalogue_name: row.displayName.trim(),
      catalogue_sku: row.productCode ?? row.existingProductCode ?? undefined,
      catalogue_slug: this.toCatalogueSlug(
        row.displayName,
        row.productCode ?? row.existingProductCode ?? '',
      ),
      catalogue_brand: this.blankToNull(row.brand),
      catalogue_model: this.blankToNull(row.model),
      catalogue_model_year: row.modelYear,
      display_name: row.displayName.trim(),
      status: row.status,
      serial_number: this.blankToNull(row.serialNumber),
      metadata: this.toMetadata(row),
    };
  }

  private async ensureDraftWarrantyCode(
    tx: Prisma.TransactionClient,
    productId: string,
    row: PreparedProductImportRow,
    importDate: Date,
  ) {
    const warranty = await tx.warranty.findUnique({
      where: { product_id: productId },
      select: { id: true, warranty_code: true, status: true },
    });

    if (warranty?.status === warranty_status.DRAFT) {
      await tx.warranty.update({
        where: { id: warranty.id },
        data: {
          duration_months: row.warrantyDurationMonths,
          terms: this.blankToNull(row.warrantyTerms),
          ...(warranty.warranty_code
            ? {}
            : {
                warranty_code: await this.resolveWarrantyCode(
                  tx,
                  row,
                  importDate,
                ),
              }),
        },
      });
      return;
    }

    if (warranty) return;

    const warrantyCode = await this.resolveWarrantyCode(tx, row, importDate);

    await tx.warranty.create({
      data: {
        product_id: productId,
        warranty_code: warrantyCode,
        duration_months: row.warrantyDurationMonths,
        start_date: null,
        end_date: null,
        status: warranty_status.DRAFT,
        terms: this.blankToNull(row.warrantyTerms),
      },
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

  private async resolveWarrantyCode(
    tx: Prisma.TransactionClient,
    row: PreparedProductImportRow,
    importDate: Date,
  ) {
    const requestedCode = this.blankToNull(row.warrantyCode)?.toUpperCase();
    return (
      requestedCode ??
      (await this.generateWarrantyCodeUseCase.execute(importDate, tx))
    );
  }

  private toCatalogueSlug(name: string, productCode: string) {
    return `${toSlug(name)}-${productCode.trim().toLowerCase()}`;
  }
}
