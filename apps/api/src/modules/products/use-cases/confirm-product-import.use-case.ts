import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import {
  prepareProductImportRows,
  PreparedProductImportRow,
} from '@/modules/products/excel/product-import.validator';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_method } from '@prisma/client';
import { toSlug } from '@/common/helpers/string.util';

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
            category_ref: { connect: { id: row.categoryId } },
            display_name: row.displayName.trim(),
            slug: this.toCatalogueSlug(row.displayName, productCode),
            brand: this.blankToNull(row.brand),
            model: this.blankToNull(row.model),
            model_year: row.modelYear,
            description: this.blankToNull(row.description),
            serial_number: this.blankToNull(row.serialNumber),
            status: row.status ?? product_status.ACTIVE,
            warranty_duration_months: row.warrantyDurationMonths,
            warranty_method: warranty_method.REPAIR,
            warranty_terms: this.blankToNull(row.warrantyTerms),
            metadata: this.toMetadata(row),
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
      display_name: row.displayName.trim(),
      product_code: row.productCode ?? row.existingProductCode ?? undefined,
      slug: this.toCatalogueSlug(
        row.displayName,
        row.productCode ?? row.existingProductCode ?? '',
      ),
      brand: this.blankToNull(row.brand),
      model: this.blankToNull(row.model),
      model_year: row.modelYear,
      description: this.blankToNull(row.description),
      status: row.status,
      serial_number: this.blankToNull(row.serialNumber),
      warranty_duration_months: row.warrantyDurationMonths,
      warranty_method: warranty_method.REPAIR,
      warranty_terms: this.blankToNull(row.warrantyTerms),
      metadata: this.toMetadata(row),
    };
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

  private toCatalogueSlug(name: string, productCode: string) {
    return `${toSlug(name)}-${productCode.trim().toLowerCase()}`;
  }
}
