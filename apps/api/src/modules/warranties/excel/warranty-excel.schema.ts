import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';
import { warranty_status } from '@prisma/client';

export const warrantyExcelColumns: Array<
  ExcelColumnDefinition<WarrantyExcelRow>
> = [
  {
    key: 'warrantyCode',
    header: 'Mã bảo hành',
    width: 22,
    example: 'WR-2026-0001',
    note: 'Có thể để trống với bảo hành nháp; nếu nhập thì mã phải duy nhất.',
    parse: parseOptionalString,
  },
  {
    key: 'productCode',
    header: 'Mã sản phẩm',
    required: true,
    width: 22,
    example: 'PRD-0001',
    note: 'Mã định danh sản phẩm trong hệ thống.',
    parse: parseRequiredString,
  },
  {
    key: 'productName',
    header: 'Tên sản phẩm',
    required: true,
    width: 32,
    example: 'Air Compressor A200',
    parse: parseRequiredString,
  },
  {
    key: 'serialNumber',
    header: 'Số serial',
    width: 24,
    example: 'SN-2026-0001',
    parse: parseOptionalString,
  },
  {
    key: 'ownerCustomerCode',
    header: 'Mã khách hàng chủ sở hữu',
    width: 24,
    example: 'CUS-0001',
    parse: parseOptionalString,
  },
  {
    key: 'ownerFullName',
    header: 'Tên chủ sở hữu',
    width: 28,
    example: 'Nguyen Van A',
    parse: parseOptionalString,
  },
  {
    key: 'startDate',
    header: 'Ngày bắt đầu',
    width: 16,
    example: '2026-07-21',
    note: 'Sử dụng định dạng yyyy-mm-dd.',
    parse: parseOptionalDate,
    format: formatDate,
  },
  {
    key: 'endDate',
    header: 'Ngày kết thúc',
    width: 16,
    example: '2027-07-21',
    note: 'Sử dụng định dạng yyyy-mm-dd.',
    parse: parseOptionalDate,
    format: formatDate,
  },
  {
    key: 'durationMonths',
    header: 'Thời hạn bảo hành (tháng)',
    required: true,
    width: 18,
    example: 12,
    parse: parsePositiveInteger,
  },
  {
    key: 'coverageLimitAmount',
    header: 'Tổng hạn mức bảo hành (VND)',
    width: 24,
    example: '50000000',
    note: 'Để trống nếu không giới hạn; tối đa 2 chữ số thập phân.',
    parse: parseOptionalDecimal,
  },
  {
    key: 'maxClaimCount',
    header: 'Số claim tối đa',
    width: 18,
    example: 3,
    note: 'Để trống nếu không giới hạn.',
    parse: parseOptionalPositiveInteger,
  },
  {
    key: 'maxAmountPerClaim',
    header: 'Hạn mức mỗi claim (VND)',
    width: 24,
    example: '10000000',
    note: 'Không được lớn hơn tổng hạn mức bảo hành.',
    parse: parseOptionalDecimal,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    required: true,
    width: 14,
    example: 'Đang hiệu lực',
    note: 'Nháp, Đang hiệu lực, Hết hạn hoặc Đã hủy.',
    parse: parseWarrantyStatus,
    format: formatWarrantyStatus,
  },
  {
    key: 'terms',
    header: 'Điều khoản bảo hành',
    width: 48,
    example: 'Bảo hành tiêu chuẩn của nhà sản xuất.',
    parse: parseOptionalString,
  },
];

function parseRequiredString(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (!parsed) {
    throw new Error('Giá trị là bắt buộc');
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
    throw new Error('Ngày phải theo định dạng yyyy-mm-dd');
  }

  return parsed;
}

function parsePositiveInteger(value: ExcelCellValue) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Giá trị phải là số nguyên dương');
  }

  return parsed;
}

function parseOptionalPositiveInteger(value: ExcelCellValue) {
  if (value === null || String(value).trim() === '') return null;
  return parsePositiveInteger(value);
}

function parseOptionalDecimal(value: ExcelCellValue) {
  if (value === null || String(value).trim() === '') return null;

  const parsed = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(parsed)) {
    throw new Error(
      'Giá trị phải là số không âm với tối đa 2 chữ số thập phân',
    );
  }

  return parsed;
}

function parseWarrantyStatus(value: ExcelCellValue) {
  const normalized = String(value).trim().toUpperCase();
  const statusAliases: Record<string, warranty_status> = {
    NHÁP: warranty_status.DRAFT,
    'ĐANG HIỆU LỰC': warranty_status.ACTIVE,
    'HẾT HẠN': warranty_status.EXPIRED,
    'ĐÃ HỦY': warranty_status.VOIDED,
  };
  const parsed = statusAliases[normalized] ?? normalized;

  if (!Object.values(warranty_status).includes(parsed)) {
    throw new Error(
      'Trạng thái phải là Nháp, Đang hiệu lực, Hết hạn hoặc Đã hủy',
    );
  }

  return parsed;
}

function formatWarrantyStatus(value: WarrantyExcelRow[keyof WarrantyExcelRow]) {
  if (value === warranty_status.DRAFT) return 'Nháp';
  if (value === warranty_status.ACTIVE) return 'Đang hiệu lực';
  if (value === warranty_status.EXPIRED) return 'Hết hạn';
  if (value === warranty_status.VOIDED) return 'Đã hủy';
  return null;
}

function formatDate(value: WarrantyExcelRow[keyof WarrantyExcelRow]) {
  if (!(value instanceof Date)) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}
