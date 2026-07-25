import { ExcelRowError } from '@/common/excel';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ConfirmProductImportRowDto } from '@/modules/products/dto/confirm-product-import.dto';

export type PreparedProductImportRow = ConfirmProductImportRowDto & {
  action: 'create' | 'update';
  existingProductId: string | null;
  rowNumber: number;
  templateId: string;
  templateWarrantyDurationMonths: number;
  templateWarrantyTerms: string | null;
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

  for (const row of rows) {
    const productCode = row.data.productCode?.trim() || null;
    const serialNumber = row.data.serialNumber?.trim() || null;
    const templateSku = row.data.templateSku?.trim().toUpperCase() || null;

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

    const [existingProduct, productWithSerial, template] = await Promise.all([
      productCode
        ? prismaService.product.findUnique({
            where: { product_code: productCode },
            select: { id: true },
          })
        : null,
      serialNumber
        ? prismaService.product.findUnique({
            where: { serial_number: serialNumber },
            select: { id: true, product_code: true },
          })
        : null,
      templateSku
        ? prismaService.productTemplate.findUnique({
            where: {
              sku: templateSku,
            },
            select: {
              id: true,
              is_active: true,
              default_warranty_duration_months: true,
              default_warranty_terms: true,
            },
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

    if (!templateSku) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'templateSku',
        message: 'SKU của product template là bắt buộc',
      });
    } else if (!template || !template.is_active) {
      errors.push({
        rowNumber: row.rowNumber,
        field: 'templateSku',
        message: 'Không tìm thấy product template đang hoạt động',
      });
    }

    preparedRows.push({
      ...row.data,
      action: existingProduct ? 'update' : 'create',
      existingProductId: existingProduct?.id ?? null,
      rowNumber: row.rowNumber,
      templateSku: templateSku ?? '',
      templateId: template?.id ?? '',
      templateWarrantyDurationMonths:
        template?.default_warranty_duration_months ?? 36,
      templateWarrantyTerms: template?.default_warranty_terms ?? null,
    });
  }

  return { errors, rows: preparedRows };
}
