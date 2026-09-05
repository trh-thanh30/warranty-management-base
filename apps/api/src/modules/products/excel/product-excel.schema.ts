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
    key: 'displayName',
    header: 'Tên sản phẩm',
    required: true,
    width: 34,
    example: 'Pin Battery Plus',
    note: 'Tên hiển thị được lưu trực tiếp trên sản phẩm.',
    parse: parseRequiredString,
  },
  {
    key: 'categoryCode',
    header: 'Mã danh mục',
    required: true,
    width: 22,
    example: 'ACCESSORY',
    note: 'Mã danh mục sản phẩm đang hoạt động.',
    parse: parseRequiredString,
  },
  {
    key: 'brand',
    header: 'Thương hiệu',
    width: 20,
    example: 'Lexzenz',
    parse: parseOptionalString,
  },
  {
    key: 'model',
    header: 'Model',
    width: 20,
    example: 'Battery Plus',
    parse: parseOptionalString,
  },
  {
    key: 'modelYear',
    header: 'Năm model',
    width: 14,
    example: 2026,
    parse: parseOptionalNumber,
  },
  {
    key: 'shortDescription',
    header: 'Mô tả ngắn',
    width: 40,
    example: 'Sản phẩm chất lượng cao cho xe của bạn.',
    parse: parseOptionalString,
  },
  {
    key: 'description',
    header: 'Mô tả',
    width: 50,
    example: 'Thông tin chi tiết về sản phẩm và phạm vi sử dụng.',
    parse: parseOptionalString,
  },
  {
    key: 'warrantyDurationMonths',
    header: 'Thời hạn bảo hành (tháng)',
    required: true,
    width: 26,
    example: 24,
    parse: parseRequiredNumber,
  },
  {
    key: 'warrantyTerms',
    header: 'Điều khoản bảo hành',
    width: 36,
    example: 'Áp dụng theo điều kiện bảo hành của hãng.',
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

function parseOptionalNumber(value: ExcelCellValue) {
  if (value === null || String(value).trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error('Value must be an integer');
  return parsed;
}

function parseRequiredNumber(value: ExcelCellValue) {
  const parsed = parseOptionalNumber(value);
  if (parsed === null) throw new Error('Value is required');
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
