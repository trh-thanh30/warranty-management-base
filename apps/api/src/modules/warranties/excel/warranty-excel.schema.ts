import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';
import { warranty_status } from '@prisma/client';

export const warrantyExcelColumns: Array<
  ExcelColumnDefinition<WarrantyExcelRow>
> = [
  {
    key: 'warrantyCode',
    header: 'Warranty Code',
    width: 22,
    example: 'WR-2026-0001',
    note: 'Optional for draft warranties; must be unique when provided.',
    parse: parseOptionalString,
  },
  {
    key: 'productCode',
    header: 'Product Code',
    required: true,
    width: 22,
    example: 'PRD-0001',
    note: 'Stable product identifier in the system.',
    parse: parseRequiredString,
  },
  {
    key: 'productName',
    header: 'Product Name',
    required: true,
    width: 32,
    example: 'Air Compressor A200',
    parse: parseRequiredString,
  },
  {
    key: 'serialNumber',
    header: 'Serial Number',
    width: 24,
    example: 'SN-2026-0001',
    parse: parseOptionalString,
  },
  {
    key: 'ownerCustomerCode',
    header: 'Owner Customer Code',
    width: 24,
    example: 'CUS-0001',
    parse: parseOptionalString,
  },
  {
    key: 'ownerFullName',
    header: 'Owner Full Name',
    width: 28,
    example: 'Nguyen Van A',
    parse: parseOptionalString,
  },
  {
    key: 'startDate',
    header: 'Start Date',
    width: 16,
    example: '2026-07-21',
    note: 'Use yyyy-mm-dd.',
    parse: parseOptionalDate,
    format: formatDate,
  },
  {
    key: 'endDate',
    header: 'End Date',
    width: 16,
    example: '2027-07-21',
    note: 'Use yyyy-mm-dd.',
    parse: parseOptionalDate,
    format: formatDate,
  },
  {
    key: 'durationMonths',
    header: 'Duration Months',
    required: true,
    width: 18,
    example: 12,
    parse: parsePositiveInteger,
  },
  {
    key: 'status',
    header: 'Status',
    required: true,
    width: 14,
    example: warranty_status.ACTIVE,
    note: `Allowed: ${Object.values(warranty_status).join(', ')}.`,
    parse: parseWarrantyStatus,
  },
  {
    key: 'terms',
    header: 'Terms',
    width: 48,
    example: 'Standard manufacturer warranty.',
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

function parseOptionalDate(value: ExcelCellValue) {
  if (value === null) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Date must use yyyy-mm-dd');
  }

  return parsed;
}

function parsePositiveInteger(value: ExcelCellValue) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Value must be a positive integer');
  }

  return parsed;
}

function parseWarrantyStatus(value: ExcelCellValue) {
  const parsed = String(value).trim().toUpperCase();

  if (!Object.values(warranty_status).includes(parsed as warranty_status)) {
    throw new Error(
      `Status must be one of ${Object.values(warranty_status).join(', ')}`,
    );
  }

  return parsed as warranty_status;
}

function formatDate(value: WarrantyExcelRow[keyof WarrantyExcelRow]) {
  if (!(value instanceof Date)) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}
