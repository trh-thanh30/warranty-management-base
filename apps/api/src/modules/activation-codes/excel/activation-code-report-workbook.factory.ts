import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import type { ActivationCodeReportRow } from '@/modules/activation-codes/activation-code-reporting.types';
import type { activation_code_status } from '@prisma/client';

const statusLabels: Record<activation_code_status, string> = {
  AVAILABLE: 'Có thể kích hoạt',
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVATED: 'Đã kích hoạt',
  EXPIRED: 'Đã hết hạn',
  REVOKED: 'Đã thu hồi',
  REPLACED: 'Đã thay thế',
};

export async function createActivationCodeReportWorkbook(
  rows: ActivationCodeReportRow[],
) {
  const workbook = createExcelWorkbook('Báo cáo mã kích hoạt');
  const worksheet = addDataWorksheet(workbook, {
    name: 'Mã kích hoạt',
    columns: [
      { key: 'batchCode', header: 'Lô mã', width: 28 },
      { key: 'batchName', header: 'Tên lô mã', width: 32 },
      { key: 'productSku', header: 'SKU sản phẩm', width: 24 },
      { key: 'productName', header: 'Tên sản phẩm', width: 34 },
      { key: 'status', header: 'Trạng thái', width: 20 },
      { key: 'createdAt', header: 'Ngày tạo', width: 22 },
      { key: 'expiresAt', header: 'Ngày hết hạn', width: 22 },
      { key: 'activatedAt', header: 'Ngày kích hoạt', width: 22 },
      { key: 'provinceName', header: 'Tỉnh/thành', width: 24 },
      { key: 'dealerCode', header: 'Mã đại lý', width: 18 },
      { key: 'dealerName', header: 'Đại lý', width: 30 },
    ],
    rows: rows.map((row) => ({
      ...row,
      status: statusLabels[row.status],
    })),
  });
  for (const key of ['createdAt', 'expiresAt', 'activatedAt']) {
    worksheet.getColumn(key).numFmt = 'dd/mm/yyyy hh:mm';
  }
  return workbookToBuffer(workbook);
}
