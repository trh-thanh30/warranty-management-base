import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { warrantyExcelColumns } from '@/modules/warranties/excel/warranty-excel.schema';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';

export async function createWarrantyImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Warranty Import Template');
  addDataWorksheet<WarrantyExcelRow>(workbook, {
    name: 'Warranties',
    columns: warrantyExcelColumns,
    rows: [
      {
        warrantyCode: 'WR-2026-0001',
        productCode: 'PRD-0001',
        productName: 'Air Compressor A200',
        serialNumber: 'SN-2026-0001',
        ownerCustomerCode: 'CUS-0001',
        ownerFullName: 'Nguyen Van A',
        startDate: new Date('2026-07-21'),
        endDate: new Date('2027-07-21'),
        durationMonths: 12,
        status: 'ACTIVE',
        terms: 'Standard manufacturer warranty.',
      },
    ],
  });
  addInstructionsWorksheet(workbook, warrantyExcelColumns);

  return workbookToBuffer(workbook);
}

export async function createWarrantyExportWorkbook(rows: WarrantyExcelRow[]) {
  const workbook = createExcelWorkbook('Warranty Export');
  addDataWorksheet(workbook, {
    name: 'Warranties',
    columns: warrantyExcelColumns,
    rows,
  });

  return workbookToBuffer(workbook);
}
