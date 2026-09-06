import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import type { ActivationCodeReportRow } from '@/modules/activation-codes/activation-code-reporting.types';

export async function createActivationCodeReportWorkbook(
  rows: ActivationCodeReportRow[],
) {
  const workbook = createExcelWorkbook('Báo cáo mã kích hoạt');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Mã kích hoạt',
    columns: [
      { key: 'batchCode', header: 'Lô mã', width: 20 },
      { key: 'productSku', header: 'SKU sản phẩm', width: 24 },
      { key: 'productName', header: 'Tên sản phẩm', width: 34 },
      { key: 'status', header: 'Trạng thái', width: 20 },
      { key: 'createdAt', header: 'Ngày tạo', width: 22 },
      { key: 'expiresAt', header: 'Ngày hết hạn', width: 22 },
      { key: 'activatedAt', header: 'Ngày kích hoạt', width: 22 },
      { key: 'provinceCode', header: 'Mã tỉnh/thành', width: 16 },
      { key: 'provinceName', header: 'Tỉnh/thành', width: 24 },
      { key: 'dealerCode', header: 'Mã đại lý', width: 18 },
      { key: 'dealerName', header: 'Đại lý', width: 30 },
    ],
    rows,
  });
  for (const key of ['createdAt', 'expiresAt', 'activatedAt']) {
    worksheet.getColumn(key).numFmt = 'dd/mm/yyyy hh:mm';
  }
  return workbookToBuffer(workbook);
}
