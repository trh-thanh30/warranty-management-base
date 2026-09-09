import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { warrantyActivationRequestExcelColumns } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.schema';
import type { WarrantyActivationRequestExcelRow } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.types';

export async function createWarrantyActivationRequestExportWorkbook(
  rows: WarrantyActivationRequestExcelRow[],
) {
  const workbook = createExcelWorkbook('Xuất yêu cầu kích hoạt bảo hành');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Yêu cầu kích hoạt',
    columns: warrantyActivationRequestExcelColumns,
    rows,
  });

  worksheet.getColumn('customerPhone').numFmt = '@';
  worksheet.getColumn('customerBirthdate').numFmt = 'dd/mm/yyyy';
  ['installedAt', 'reviewedAt', 'createdAt', 'updatedAt'].forEach((key) => {
    worksheet.getColumn(key).numFmt = 'dd/mm/yyyy hh:mm';
  });

  return workbookToBuffer(workbook);
}
