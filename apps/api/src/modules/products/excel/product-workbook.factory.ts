import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { product_status } from '@prisma/client';

export async function createProductImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Product Import Template');
  addDataWorksheet<ProductExcelRow>(workbook, {
    name: 'Products',
    columns: productExcelColumns,
    rows: [
      {
        productCode: null,
        displayName: 'Pin Battery Plus',
        categoryCode: 'ACCESSORY',
        brand: 'Lexzenz',
        model: 'Battery Plus',
        modelYear: 2026,
        shortDescription: 'Sản phẩm chất lượng cao cho xe của bạn.',
        description: 'Thông tin chi tiết về sản phẩm và phạm vi sử dụng.',
        warrantyDurationMonths: 24,
        warrantyTerms: null,
        installationPosition: 'Khoang động cơ',
        warrantyCode: null,
        serialNumber: 'SN-001',
        status: product_status.ACTIVE,
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
