import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { product_category, product_status } from '@prisma/client';

export async function createProductImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Product Import Template');
  addDataWorksheet<ProductExcelRow>(workbook, {
    name: 'Products',
    columns: productExcelColumns,
    rows: [
      {
        productCode: null,
        name: 'Bộ pin chính hãng',
        imageUrl: 'https://example.com/images/product.jpg',
        category: product_category.SPARE_PART,
        categoryCode: 'BATTERY',
        brand: 'Toyota',
        model: 'Battery Plus',
        manufactureYear: 2026,
        serialNumber: 'SN-001',
        status: product_status.ACTIVE,
        warrantyDurationMonths: 36,
        warrantyTerms: 'Bảo hành tiêu chuẩn.',
        description: 'Dòng dữ liệu import sản phẩm.',
      },
    ],
  });
  addInstructionsWorksheet(workbook, productExcelColumns);

  return workbookToBuffer(workbook);
}

export async function createProductExportWorkbook(rows: ProductExcelRow[]) {
  const workbook = createExcelWorkbook('Product Export');
  addDataWorksheet(workbook, {
    name: 'Products',
    columns: productExcelColumns,
    rows,
  });

  return workbookToBuffer(workbook);
}
