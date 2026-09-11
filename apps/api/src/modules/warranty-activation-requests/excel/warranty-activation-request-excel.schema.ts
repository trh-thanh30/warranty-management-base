import type { ExcelColumnDefinition } from '@/common/excel';
import type { WarrantyActivationRequestExcelRow } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.types';

export const warrantyActivationRequestExcelColumns: Array<
  ExcelColumnDefinition<WarrantyActivationRequestExcelRow>
> = [
  { key: 'requestCode', header: 'Mã yêu cầu', width: 22 },
  { key: 'status', header: 'Trạng thái', width: 20 },
  { key: 'warrantyCode', header: 'Mã bảo hành', width: 22 },
  { key: 'itemCount', header: 'Số sản phẩm', width: 16 },
  {
    key: 'productsByPosition',
    header: 'Sản phẩm theo vị trí',
    width: 56,
  },
  { key: 'customerName', header: 'Tên khách hàng', width: 28 },
  { key: 'customerPhone', header: 'Số điện thoại', width: 20 },
  { key: 'customerEmail', header: 'Email', width: 32 },
  { key: 'customerBirthdate', header: 'Ngày sinh', width: 16 },
  { key: 'fullAddress', header: 'Địa chỉ đầy đủ', width: 48 },
  { key: 'productName', header: 'Tên sản phẩm', width: 32 },
  { key: 'brand', header: 'Thương hiệu', width: 20 },
  { key: 'model', header: 'Dòng sản phẩm', width: 22 },
  { key: 'customerNote', header: 'Ghi chú khách hàng', width: 40 },
  { key: 'adminNote', header: 'Ghi chú xử lý', width: 40 },
  { key: 'rejectionReason', header: 'Lý do từ chối', width: 40 },
  { key: 'reviewedBy', header: 'Người xử lý', width: 28 },
  { key: 'reviewedAt', header: 'Ngày xử lý', width: 22 },
  { key: 'installedAt', header: 'Ngày thi công', width: 22 },
  { key: 'createdAt', header: 'Ngày gửi yêu cầu', width: 22 },
  { key: 'updatedAt', header: 'Ngày cập nhật', width: 22 },
];
