import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { serviceCenterExcelColumns } from '@/modules/service-centers/excel/service-center-excel.schema';
import { ServiceCenterExcelRow } from '@/modules/service-centers/excel/service-center-excel.types';
import { DataValidation, Worksheet } from 'exceljs';

export async function createServiceCenterImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Mẫu import trạm bảo hành');
  const worksheet = addDataWorksheet<ServiceCenterExcelRow>(workbook, {
    name: 'Trạm bảo hành',
    columns: serviceCenterExcelColumns,
    rows: [
      {
        name: 'Trạm bảo hành Đà Nẵng',
        phone: '0901234567',
        email: 'danang@example.com',
        province: 'Đà Nẵng',
        district: 'Phường Hải Châu',
        address: '1 Nguyễn Văn Linh',
        latitude: 16.0544,
        longitude: 108.2022,
        isActive: true,
      },
    ],
  });
  configureDataWorksheet(worksheet, true);
  addInstructionsWorksheet(workbook, serviceCenterExcelColumns);
  return workbookToBuffer(workbook);
}

export async function createServiceCenterExportWorkbook(
  rows: ServiceCenterExcelRow[],
) {
  const workbook = createExcelWorkbook('Xuất trạm bảo hành');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Trạm bảo hành',
    columns: serviceCenterExcelColumns,
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
    worksheet.getCell(`I${row}`).dataValidation = validation;
  }
}
