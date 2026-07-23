import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { dealerExcelColumns } from '@/modules/dealers/excel/dealer-excel.schema';
import { DealerExcelRow } from '@/modules/dealers/excel/dealer-excel.types';
import { DataValidation, Worksheet } from 'exceljs';

export async function createDealerImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Mẫu import đại lý');
  const worksheet = addDataWorksheet<DealerExcelRow>(workbook, {
    name: 'Đại lý',
    columns: dealerExcelColumns,
    rows: [
      {
        address: '12 Nguyễn Trãi, Thanh Xuân',
        isActive: true,
        name: 'Đại lý Lexzenz Hà Nội',
        phone: '0901234567',
        province: 'Thành phố Hà Nội',
        district: 'Phường Thanh Xuân',
        salesName: 'Nguyễn Văn A',
      },
    ],
  });
  configureDataWorksheet(worksheet, true);
  addInstructionsWorksheet(workbook, dealerExcelColumns);
  return workbookToBuffer(workbook);
}

export async function createDealerExportWorkbook(rows: DealerExcelRow[]) {
  const workbook = createExcelWorkbook('Xuất đại lý');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Đại lý',
    columns: dealerExcelColumns,
    rows,
  });
  configureDataWorksheet(worksheet);
  return workbookToBuffer(workbook);
}

function configureDataWorksheet(
  worksheet: Worksheet,
  includeStatusValidation = false,
) {
  worksheet.getColumn('phone').numFmt = '@';
  if (!includeStatusValidation) return;

  const validation: DataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"Đang hoạt động,Ngưng hoạt động"'],
    showErrorMessage: true,
    errorTitle: 'Trạng thái không hợp lệ',
    error: 'Chọn một trạng thái trong danh sách.',
  };
  for (let row = 2; row <= 1000; row += 1) {
    worksheet.getCell(`G${row}`).dataValidation = validation;
  }
}
