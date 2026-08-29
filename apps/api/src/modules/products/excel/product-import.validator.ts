import { ExcelRowError } from '@/common/excel';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportRowDto } from '@/modules/products/dto/confirm-product-import.dto';
import { category_type } from '@prisma/client';

export type PreparedProductImportRow = ConfirmProductImportRowDto & {
  action: 'create' | 'update';
  existingProductId: string | null;
  existingProductCode: string | null;
  rowNumber: number;
  categoryId: string;
};

type ProductImportValidationRow = ConfirmProductImportRowDto;

export async function prepareProductImportRows(
  prismaService: PrismaService,
  rows: Array<{
    data: ProductImportValidationRow;
    rowNumber: number;
  }>,
) {
  const errors: ExcelRowError[] = [];
  const preparedRows: PreparedProductImportRow[] = [];
  const seenProductCodes = new Set<string>();
  const seenSerialNumbers = new Set<string>();
  const seenWarrantyCodes = new Set<string>();

  for (const row of rows) {
    const productCode = row.data.productCode?.trim() || null;
    const serialNumber = row.data.serialNumber?.trim() || null;
    const productName = row.data.productName?.trim() || null;
    const categoryCode = row.data.categoryCode?.trim().toUpperCase() || null;
    const warrantyCode = row.data.warrantyCode?.trim().toUpperCase() || null;

    if (productCode) {
      if (seenProductCodes.has(productCode)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'productCode',
          message: 'Mã sản phẩm bị trùng trong file import',
        });
      }
      seenProductCodes.add(productCode);
    }

    if (serialNumber) {
      if (seenSerialNumbers.has(serialNumber)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'serialNumber',
          message: 'Số serial bị trùng trong file import',
        });
      }
      seenSerialNumbers.add(serialNumber);
    }

    if (warrantyCode) {
      if (seenWarrantyCodes.has(warrantyCode)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'warrantyCode',
          message: 'Mã bảo hành bị trùng trong file import',
        });
      }
      seenWarrantyCodes.add(warrantyCode);
    }

    const [existingProduct, productWithSerial, productWithWarranty, category] =
      await Promise.all([
        productCode
          ? prismaService.product.findUnique({
              where: { product_code: productCode },
              select: { id: true, product_code: true },
            })
          : null,
        serialNumber
          ? prismaService.product.findUnique({
              where: { serial_number: serialNumber },
              select: { id: true, product_code: true },
            })
          : null,
        warrantyCode
          ? prismaService.warranty.findUnique({
              where: { warranty_code: warrantyCode },
              select: { product_id: true },
            })
          : null,
        categoryCode
          ? prismaService.category.findFirst({
              where: {
                code: categoryCode,
                type: category_type.PRODUCT,
                is_active: true,
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
        rowNumber: row.rowNumber,
        field: 'serialNumber',
        message: `Số serial đã thuộc sản phẩm ${productWithSerial.product_code}`,
      });
    }

    if (
      productWithWarranty &&
      (!existingProduct ||
        productWithWarranty.product_id !== existingProduct.id)
    ) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'warrantyCode',
        message: 'Mã bảo hành đã thuộc sản phẩm khác',
      });
    }

    if (!productName) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'productName',
        message: 'Tên sản phẩm là bắt buộc',
      });
    }

    if (!categoryCode) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'categoryCode',
        message: 'Mã danh mục là bắt buộc',
      });
    } else if (!category) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'categoryCode',
        message: 'Không tìm thấy danh mục sản phẩm đang hoạt động',
      });
    }

    preparedRows.push({
      ...row.data,
      action: existingProduct ? 'update' : 'create',
      existingProductId: existingProduct?.id ?? null,
      existingProductCode: existingProduct?.product_code ?? null,
      rowNumber: row.rowNumber,
      productName: productName ?? '',
      categoryCode: categoryCode ?? '',
      warrantyCode,
      categoryId: category?.id ?? '',
    });
  }

  return { errors, rows: preparedRows };
}
