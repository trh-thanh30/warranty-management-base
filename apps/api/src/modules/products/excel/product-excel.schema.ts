import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { product_category, product_status } from '@prisma/client';

export const productExcelColumns: Array<
  ExcelColumnDefinition<ProductExcelRow>
> = [
  {
    key: 'productCode',
    header: 'Product Code',
    width: 22,
    example: 'PRD-2026-ABCDEF',
    note: 'Optional for new rows. Existing product codes are used for matching during future confirm import.',
    parse: parseOptionalString,
  },
  {
    key: 'name',
    header: 'Product Name',
    required: true,
    width: 34,
    example: 'Genuine Battery Pack',
    parse: parseRequiredString,
  },
  {
    key: 'category',
    header: 'Legacy Category',
    required: true,
    width: 22,
    example: product_category.SPARE_PART,
    note: `Allowed: ${Object.values(product_category).join(', ')}.`,
    parse: parseProductCategory,
  },
  {
    key: 'categoryCode',
    header: 'Dynamic Category Code',
    width: 24,
    example: 'BATTERY',
    note: 'Optional category code from Category taxonomy.',
    parse: parseOptionalString,
  },
  {
    key: 'brand',
    header: 'Brand',
    width: 20,
    example: 'Toyota',
    parse: parseOptionalString,
  },
  {
    key: 'model',
    header: 'Model',
    width: 22,
    example: 'Battery Plus',
    parse: parseOptionalString,
  },
  {
    key: 'manufactureYear',
    header: 'Manufacture Year',
    width: 18,
    example: 2026,
    parse: parseOptionalYear,
  },
  {
    key: 'serialNumber',
    header: 'Serial Number',
    width: 24,
    example: 'SN-001',
    parse: parseOptionalString,
  },
  {
    key: 'status',
    header: 'Product Status',
    required: true,
    width: 18,
    example: product_status.ACTIVE,
    note: `Allowed: ${Object.values(product_status).join(', ')}.`,
    parse: parseProductStatus,
  },
  {
    key: 'warrantyDurationMonths',
    header: 'Warranty Duration Months',
    width: 24,
    example: 36,
    note: 'Optional. Used when a draft warranty needs default duration.',
    parse: parseOptionalPositiveInteger,
  },
  {
    key: 'warrantyTerms',
    header: 'Warranty Terms',
    width: 42,
    example: 'Standard warranty.',
    parse: parseOptionalString,
  },
  {
    key: 'description',
    header: 'Description',
    width: 48,
    example: 'Inventory import row.',
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

  if (!Object.values(product_category).includes(parsed as product_category)) {
    throw new Error(
      `Category must be one of ${Object.values(product_category).join(', ')}`,
    );
  }

  return parsed as product_category;
}

function parseProductStatus(value: ExcelCellValue) {
  const parsed = String(value).trim().toUpperCase();

  if (!Object.values(product_status).includes(parsed as product_status)) {
    throw new Error(
      `Status must be one of ${Object.values(product_status).join(', ')}`,
    );
  }

  return parsed as product_status;
}
