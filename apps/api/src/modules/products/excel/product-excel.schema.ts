import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { product_status } from '@prisma/client';
import { isProductCategory, PRODUCT_CATEGORIES } from '@repo/shared/constants';

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
    key: 'name',
    header: 'Tên sản phẩm',
    required: true,
    width: 34,
    example: 'Bộ pin chính hãng',
    parse: parseRequiredString,
  },
  {
    key: 'imageUrl',
    header: 'URL hình ảnh',
    width: 48,
    example: 'https://example.com/images/product.jpg',
    note: 'URL ảnh đại diện hoặc ảnh đầu tiên của sản phẩm. Hiện dùng để xuất dữ liệu; import ảnh từ URL sẽ xử lý ở bước confirm sau.',
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
    key: 'category',
    header: 'Danh mục legacy',
    required: true,
    width: 22,
    example: PRODUCT_CATEGORIES[2],
    note: `Giá trị hợp lệ: ${PRODUCT_CATEGORIES.join(', ')}.`,
    parse: parseProductCategory,
  },
  {
    key: 'categoryCode',
    header: 'Mã danh mục động',
    width: 24,
    example: 'BATTERY',
    note: 'Không bắt buộc. Dùng mã trong taxonomy danh mục sản phẩm.',
    parse: parseOptionalString,
  },
  {
    key: 'brand',
    header: 'Thương hiệu',
    width: 20,
    example: 'Toyota',
    parse: parseOptionalString,
  },
  {
    key: 'model',
    header: 'Mẫu',
    width: 22,
    example: 'Battery Plus',
    parse: parseOptionalString,
  },
  {
    key: 'manufactureYear',
    header: 'Năm sản xuất',
    width: 18,
    example: 2026,
    parse: parseOptionalYear,
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
  {
    key: 'warrantyDurationMonths',
    header: 'Thời hạn bảo hành (tháng)',
    width: 24,
    example: 36,
    note: 'Không bắt buộc. Dùng khi bảo hành nháp cần thời hạn mặc định.',
    parse: parseOptionalPositiveInteger,
  },
  {
    key: 'warrantyTerms',
    header: 'Điều khoản bảo hành',
    width: 42,
    example: 'Bảo hành tiêu chuẩn.',
    parse: parseOptionalString,
  },
  {
    key: 'description',
    header: 'Mô tả',
    width: 48,
    example: 'Dòng dữ liệu import sản phẩm.',
    parse: parseOptionalString,
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

function parseOptionalYear(value: ExcelCellValue) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  const currentYear = new Date().getFullYear() + 1;

  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > currentYear) {
    throw new Error(`Year must be between 1900 and ${currentYear}`);
  }

  return parsed;
}

function parseOptionalPositiveInteger(value: ExcelCellValue) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Value must be a positive integer');
  }

  return parsed;
}

function parseProductCategory(value: ExcelCellValue) {
  const parsed = String(value).trim().toUpperCase();
  if (!isProductCategory(parsed)) {
    throw new Error(`Category must be one of ${PRODUCT_CATEGORIES.join(', ')}`);
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
