import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { product_status } from '@prisma/client';

export const productExcelColumns: Array<
  ExcelColumnDefinition<ProductExcelRow>
> = [
  {
    key: 'productCode',
    header: 'Mã sản phẩm',
    width: 22,
    example: 'PRD-2026-ABCDEF',
    note: 'Không bắt buộc với dòng tạo mới. Mã sản phẩm có sẵn được dùng để đối chiếu khi xác nhận import.',
    parse: parseOptionalString,
  },
  {
    key: 'templateSku',
    header: 'SKU product template',
    required: true,
    width: 26,
    example: 'BATTERY-PLUS',
    note: 'SKU của product template đã tồn tại và đang hoạt động.',
    parse: parseRequiredString,
  },
  {
    key: 'displayName',
    header: 'Tên hiển thị thiết bị',
    width: 34,
    example: 'Pin xe khách Nguyễn Văn A',
    note: 'Không bắt buộc. Chỉ dùng khi thiết bị cụ thể cần tên hiển thị riêng.',
    parse: parseOptionalString,
  },
  {
    key: 'installationPosition',
    header: 'Vị trí gắn',
    width: 28,
    example: 'Kính lái',
    note: 'Vị trí lắp/gắn sản phẩm trên xe hoặc thiết bị.',
    parse: parseOptionalString,
  },
  {
    key: 'warrantyCode',
    header: 'Mã bảo hành',
    width: 26,
    example: 'WM-2026-EXCEL01',
    note: 'Không bắt buộc. Nhập mã có sẵn hoặc để trống để hệ thống tự sinh mã duy nhất.',
    parse: parseOptionalWarrantyCode,
  },
  {
    key: 'serialNumber',
    header: 'Số serial',
    width: 24,
    example: 'SN-001',
    parse: parseOptionalString,
  },
  {
    key: 'status',
    header: 'Trạng thái sản phẩm',
    required: true,
    width: 18,
    example: product_status.ACTIVE,
    note: `Giá trị hợp lệ: ${Object.values(product_status).join(', ')}.`,
    parse: parseProductStatus,
  },
];

function parseRequiredString(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (!parsed) {
    throw new Error('Value is required');
  }

  return parsed;
}

function parseOptionalString(value: ExcelCellValue) {
  if (value === null) {
    return null;
  }

  return String(value).trim() || null;
}

function parseOptionalWarrantyCode(value: ExcelCellValue) {
  const parsed = parseOptionalString(value)?.toUpperCase() ?? null;
  if (parsed && !/^[A-Z0-9-]{6,64}$/.test(parsed)) {
    throw new Error(
      'Warranty code must contain 6-64 letters, numbers, or hyphens',
    );
  }

  return parsed;
}

function parseProductStatus(value: ExcelCellValue) {
  const parsed = String(value).trim().toUpperCase();
  const status = Object.values(product_status).find(
    (value) => value === parsed,
  );

  if (!status) {
    throw new Error(
      `Status must be one of ${Object.values(product_status).join(', ')}`,
    );
  }

  return status;
}
