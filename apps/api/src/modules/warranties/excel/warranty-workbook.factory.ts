import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { warrantyExcelColumns } from '@/modules/warranties/excel/warranty-excel.schema';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';

export async function createWarrantyImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Mẫu import bảo hành');
  addDataWorksheet<WarrantyExcelRow>(workbook, {
    name: 'Bảo hành',
    columns: warrantyExcelColumns,
    rows: [
      {
        warrantyCode: 'WR-2026-0001',
        productCode: 'PRD-0001',
        productName: 'Máy nén khí A200',
        serialNumber: 'SN-2026-0001',
        ownerCustomerCode: 'CUS-0001',
        ownerFullName: 'Nguyễn Văn A',
        startDate: new Date('2026-07-21'),
        endDate: new Date('2027-07-21'),
        durationMonths: 12,
        coverageLimitAmount: '50000000',
        maxClaimCount: 3,
        maxAmountPerClaim: '10000000',
        status: 'ACTIVE',
        terms: 'Bảo hành tiêu chuẩn của nhà sản xuất.',
      },
    ],
  });
  addInstructionsWorksheet(workbook, warrantyExcelColumns);

  return workbookToBuffer(workbook);
}

export async function createWarrantyExportWorkbook(rows: WarrantyExcelRow[]) {
  const workbook = createExcelWorkbook('Xuất danh sách bảo hành');
  addDataWorksheet(workbook, {
    name: 'Bảo hành',
    columns: warrantyExcelColumns,
    rows,
  });

  return workbookToBuffer(workbook);
}
