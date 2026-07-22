import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { customerExcelColumns } from '@/modules/customers/excel/customer-excel.schema';
import { CustomerExcelRow } from '@/modules/customers/excel/customer-excel.types';

export async function createCustomerImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Customer Import Template');
  addDataWorksheet<CustomerExcelRow>(workbook, {
    name: 'Customers',
    columns: customerExcelColumns,
    rows: [
      {
        customerCode: null,
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'khachhang@example.com',
        address: 'Số 1 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      },
    ],
  });
  addInstructionsWorksheet(workbook, customerExcelColumns);

  return workbookToBuffer(workbook);
}

export async function createCustomerExportWorkbook(rows: CustomerExcelRow[]) {
  const workbook = createExcelWorkbook('Customer Export');
  addDataWorksheet(workbook, {
    name: 'Customers',
    columns: customerExcelColumns,
    rows,
  });

  return workbookToBuffer(workbook);
}
