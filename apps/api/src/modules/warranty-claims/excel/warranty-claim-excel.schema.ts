import type { ExcelColumnDefinition } from '@/common/excel';
import type { WarrantyClaimExcelRow } from '@/modules/warranty-claims/excel/warranty-claim-excel.types';

export const warrantyClaimExcelColumns: Array<
  ExcelColumnDefinition<WarrantyClaimExcelRow>
> = [
  { key: 'claimCode', header: 'Mã claim', width: 20 },
  { key: 'warrantyCode', header: 'Mã bảo hành', width: 22 },
  { key: 'productCode', header: 'Mã sản phẩm', width: 20 },
  { key: 'productName', header: 'Tên sản phẩm', width: 32 },
  { key: 'serialNumber', header: 'Số serial', width: 24 },
  { key: 'requesterName', header: 'Người yêu cầu', width: 28 },
  { key: 'requesterPhone', header: 'SĐT người yêu cầu', width: 20 },
  { key: 'customerName', header: 'Chủ sở hữu', width: 28 },
  { key: 'issueTitle', header: 'Tiêu đề sự cố', width: 36 },
  { key: 'issueDetail', header: 'Mô tả sự cố', width: 48 },
  { key: 'status', header: 'Trạng thái claim', width: 22 },
  { key: 'priority', header: 'Mức ưu tiên', width: 18 },
  { key: 'slaStatus', header: 'Trạng thái SLA', width: 22 },
  { key: 'dueAt', header: 'Hạn xử lý', width: 22 },
  { key: 'slaBreachedAt', header: 'Thời điểm vi phạm SLA', width: 24 },
  { key: 'serviceCenterName', header: 'Trạm bảo hành', width: 34 },
  { key: 'serviceCenterProvince', header: 'Tỉnh hoặc thành phố', width: 24 },
  { key: 'serviceCenterPhone', header: 'SĐT trạm', width: 20 },
  { key: 'submittedAt', header: 'Ngày gửi', width: 22 },
  { key: 'resolvedAt', header: 'Ngày xử lý xong', width: 22 },
  { key: 'createdAt', header: 'Ngày tạo', width: 22 },
];
