import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { staffExcelColumns } from '@/modules/user/excel/staff-excel.schema';
import { StaffExcelRow } from '@/modules/user/excel/staff-excel.types';

export async function createStaffImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Staff Import Template');
  addDataWorksheet<StaffExcelRow>(workbook, {
    name: 'Nhân viên',
    columns: staffExcelColumns,
    rows: [
      {
        email: 'nhanvien@example.com',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        status: 'Đang hoạt động',
        username: 'nguyenvana',
      },
    ],
  });
  addInstructionsWorksheet(workbook, staffExcelColumns);

  return workbookToBuffer(workbook);
}

export async function createStaffExportWorkbook(rows: StaffExcelRow[]) {
  const workbook = createExcelWorkbook('Staff Export');
  addDataWorksheet(workbook, {
    name: 'Nhân viên',
    columns: staffExcelColumns,
    rows,
  });

  return workbookToBuffer(workbook);
}
