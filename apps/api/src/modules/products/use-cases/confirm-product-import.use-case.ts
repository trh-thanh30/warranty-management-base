import { ExcelRowError } from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import { Injectable } from '@nestjs/common';
import {
  category_type,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

type ImportAction = 'create' | 'update';

type PreparedProductImportRow = ConfirmProductImportDto['rows'][number] & {
  action: ImportAction;
  categoryId: string | null;
  existingProductId: string | null;
  rowNumber: number;
};

@Injectable()
export class ConfirmProductImportUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(dto: ConfirmProductImportDto) {
    if (dto.rows.length === 0) {
      throw new BadRequestError('Import rows are required');
    }

    const { errors, rows } = await this.prepareRows(dto.rows);

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

  private async prepareRows(rows: ConfirmProductImportDto['rows']) {
    const errors: ExcelRowError[] = [];
    const preparedRows: PreparedProductImportRow[] = [];
    const seenProductCodes = new Set<string>();
    const seenSerialNumbers = new Set<string>();

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 1;
      const productCode = row.productCode?.trim() || null;
      const serialNumber = row.serialNumber?.trim() || null;
      const categoryCode = row.categoryCode?.trim() || null;

      if (productCode) {
        if (seenProductCodes.has(productCode)) {
          errors.push({
            rowNumber,
            field: 'productCode',
            message: 'Mã sản phẩm bị trùng trong file import',
          });
        }
        seenProductCodes.add(productCode);
      }

      if (serialNumber) {
        if (seenSerialNumbers.has(serialNumber)) {
          errors.push({
            rowNumber,
            field: 'serialNumber',
            message: 'Số serial bị trùng trong file import',
          });
        }
        seenSerialNumbers.add(serialNumber);
      }

      const [existingProduct, productWithSerial, category] = await Promise.all([
        productCode
          ? this.prismaService.product.findUnique({
              where: { product_code: productCode },
              select: { id: true },
            })
          : null,
        serialNumber
          ? this.prismaService.product.findUnique({
              where: { serial_number: serialNumber },
              select: { id: true, product_code: true },
            })
          : null,
        categoryCode
          ? this.prismaService.category.findFirst({
              where: {
                code: categoryCode,
                type: category_type.PRODUCT,
              },
              select: { id: true },
            })
          : null,
      ]);

      if (
        productWithSerial &&
        (!existingProduct || productWithSerial.id !== existingProduct.id)
      ) {
        errors.push({
          rowNumber,
          field: 'serialNumber',
          message: `Số serial đã thuộc sản phẩm ${productWithSerial.product_code}`,
        });
      }

      if (categoryCode && !category) {
        errors.push({
          rowNumber,
          field: 'categoryCode',
          message: 'Không tìm thấy mã danh mục động',
        });
      }

      preparedRows.push({
        ...row,
        action: existingProduct ? 'update' : 'create',
        categoryId: category?.id ?? null,
        existingProductId: existingProduct?.id ?? null,
        rowNumber,
      });
    }

    return {
      errors,
      rows: preparedRows,
    };
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
