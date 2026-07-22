import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { CategoryExcelRow } from '@/modules/categories/excel/category-excel.types';
import { category_type } from '@prisma/client';
import type { CategoryType } from '@repo/shared';
import { CATEGORY_TYPES } from '@repo/shared/constants';

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  PRODUCT: 'Sản phẩm',
  CONTENT_PAGE: 'Trang nội dung',
  ASSET: 'Tài sản',
  WARRANTY_CLAIM_ISSUE: 'Nhóm lỗi bảo hành',
};

export const categoryExcelColumns: Array<
  ExcelColumnDefinition<CategoryExcelRow>
> = [
  {
    key: 'type',
    header: 'Loại danh mục',
    required: true,
    width: 24,
    example: 'Sản phẩm',
    note: 'Sản phẩm, Trang nội dung, Tài sản hoặc Nhóm lỗi bảo hành.',
    parse: parseCategoryType,
    format: getCategoryTypeLabel,
  },
  {
    key: 'code',
    header: 'Mã danh mục',
    width: 20,
    example: 'CAT-SUV',
    note: 'Không bắt buộc. Chỉ gồm chữ, số, gạch dưới hoặc gạch ngang.',
    parse: parseCode,
  },
  {
    key: 'slug',
    header: 'Slug',
    required: true,
    width: 26,
    example: 'xe-suv',
    note: 'Khóa cập nhật cùng với loại danh mục; dùng chữ thường, số và dấu gạch ngang.',
    parse: parseSlug,
  },
  {
    key: 'name',
    header: 'Tên danh mục',
    required: true,
    width: 32,
    example: 'Xe SUV',
    parse: (value) => parseRequiredString(value, 160),
  },
  {
    key: 'description',
    header: 'Mô tả',
    width: 42,
    example: 'Danh mục xe thể thao đa dụng',
    parse: (value) => parseOptionalString(value, 500),
  },
  {
    key: 'parentSlug',
    header: 'Slug danh mục cha',
    width: 28,
    example: 'xe-o-to',
    note: 'Để trống nếu là danh mục gốc. Danh mục cha phải cùng loại.',
    parse: parseOptionalSlug,
  },
  {
    key: 'icon',
    header: 'Biểu tượng',
    width: 20,
    example: 'Car',
    parse: (value) => parseOptionalString(value, 80),
  },
  {
    key: 'imageUrl',
    header: 'URL hình ảnh',
    width: 42,
    example: 'https://example.com/category.jpg',
    parse: (value) => parseOptionalString(value, 500),
  },
  {
    key: 'order',
    header: 'Thứ tự',
    required: true,
    width: 14,
    example: 10,
    parse: parseInteger,
  },
  {
    key: 'isActive',
    header: 'Trạng thái',
    required: true,
    width: 20,
    example: 'Đang hoạt động',
    note: 'Đang hoạt động hoặc Ngưng hoạt động.',
    parse: parseStatus,
    format: (value) => (value === true ? 'Đang hoạt động' : 'Ngưng hoạt động'),
  },
  {
    key: 'metadata',
    header: 'Dữ liệu mở rộng (JSON)',
    width: 34,
    example: '{"segment":"vehicle"}',
    note: 'Không bắt buộc. Phải là một JSON object hợp lệ.',
    parse: parseMetadata,
    format: (value) => (value ? JSON.stringify(value) : null),
  },
];

function parseCategoryType(value: ExcelCellValue) {
  const normalized = String(value).trim().toLowerCase();
  const match = CATEGORY_TYPES.find(
    (type) =>
      type.toLowerCase() === normalized ||
      CATEGORY_TYPE_LABELS[type].toLowerCase() === normalized,
  );

  if (!match) throw new Error('Loại danh mục không hợp lệ');
  return match;
}

function parseCode(value: ExcelCellValue) {
  const parsed = parseOptionalString(value, 64)?.toUpperCase() ?? null;
  if (parsed && !/^[A-Z0-9_-]+$/.test(parsed)) {
    throw new Error('Mã danh mục không hợp lệ');
  }
  return parsed;
}

function parseSlug(value: ExcelCellValue) {
  const parsed = parseRequiredString(value, 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed)) {
    throw new Error('Slug không hợp lệ');
  }
  return parsed;
}

function parseOptionalSlug(value: ExcelCellValue) {
  const parsed = parseOptionalString(value, 120)?.toLowerCase() ?? null;
  if (parsed && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed)) {
    throw new Error('Slug danh mục cha không hợp lệ');
  }
  return parsed;
}

function parseInteger(value: ExcelCellValue) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error('Thứ tự phải là số nguyên');
  return parsed;
}

function parseStatus(value: ExcelCellValue) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['đang hoạt động', 'active', 'true', '1'].includes(normalized))
    return true;
  if (['ngưng hoạt động', 'inactive', 'false', '0'].includes(normalized))
    return false;
  throw new Error('Trạng thái không hợp lệ');
}

function parseMetadata(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (!parsed) return null;
  try {
    const metadata: unknown = JSON.parse(parsed);
    if (!isRecord(metadata)) {
      throw new Error();
    }
    return metadata;
  } catch {
    throw new Error('Dữ liệu mở rộng phải là JSON object hợp lệ');
  }
}

function parseRequiredString(value: ExcelCellValue, maxLength?: number) {
  const parsed = parseOptionalString(value, maxLength);
  if (!parsed) throw new Error('Giá trị không được để trống');
  return parsed;
}

function parseOptionalString(value: ExcelCellValue, maxLength?: number) {
  const parsed = value === null ? null : String(value).trim() || null;
  if (parsed && maxLength && parsed.length > maxLength) {
    throw new Error(`Giá trị không được quá ${maxLength} ký tự`);
  }
  return parsed;
}

export function getCategoryTypeLabel(type: category_type) {
  return CATEGORY_TYPE_LABELS[type];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === 'object';
}
