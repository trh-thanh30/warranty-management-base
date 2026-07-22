import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { warrantyClaimExcelColumns } from '@/modules/warranty-claims/excel/warranty-claim-excel.schema';
import type { WarrantyClaimExcelRow } from '@/modules/warranty-claims/excel/warranty-claim-excel.types';

export async function createWarrantyClaimExportWorkbook(
  rows: WarrantyClaimExcelRow[],
) {
  const workbook = createExcelWorkbook('Xuất danh sách yêu cầu bảo hành');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Yêu cầu bảo hành',
    columns: warrantyClaimExcelColumns,
    rows,
  });

  ['dueAt', 'slaBreachedAt', 'submittedAt', 'resolvedAt', 'createdAt'].forEach(
    (key) => {
      worksheet.getColumn(key).numFmt = 'dd/mm/yyyy hh:mm';
    },
  );
  worksheet.getColumn('requesterPhone').numFmt = '@';
  worksheet.getColumn('serviceCenterPhone').numFmt = '@';

  return workbookToBuffer(workbook);
}
