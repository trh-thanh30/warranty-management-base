import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { StaffExcelRow } from '@/modules/user/excel/staff-excel.types';
import { user_status } from '@prisma/client';

export const staffExcelColumns: Array<ExcelColumnDefinition<StaffExcelRow>> = [
  {
    key: 'fullName',
    header: 'Họ và tên',
    required: true,
    width: 30,
    example: 'Nguyễn Văn A',
    parse: (value) => parseBoundedString(value, 2, 120, 'Full name'),
  },
  {
    key: 'username',
    header: 'Tên đăng nhập',
    required: true,
    width: 24,
    example: 'nguyenvana',
    note: 'Dùng để đăng nhập. Phải là duy nhất trong hệ thống.',
    parse: (value) => parseBoundedString(value, 2, 80, 'Username'),
  },
  {
    key: 'email',
    header: 'Email',
    required: true,
    width: 32,
    example: 'nhanvien@example.com',
    parse: parseEmail,
  },
  {
    key: 'phone',
    header: 'Số điện thoại',
    width: 22,
    example: '0901234567',
    parse: parsePhone,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    required: true,
    width: 22,
    example: 'Đang hoạt động',
    note: 'Giá trị hợp lệ: Đang hoạt động, Đã khóa, ACTIVE, INACTIVE.',
    parse: parseStatus,
  },
];

function parseRequiredString(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (!parsed) throw new Error('Value is required');
  return parsed;
}

function parseEmail(value: ExcelCellValue) {
  const parsed = parseRequiredString(value).toLowerCase();
  if (parsed.length > 160) throw new Error('Email is too long');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) {
    throw new Error('Email is invalid');
  }
  return parsed;
}

function parsePhone(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (parsed && parsed.length > 32) throw new Error('Phone is too long');
  return parsed;
}

function parseBoundedString(
  value: ExcelCellValue,
  minLength: number,
  maxLength: number,
  label: string,
) {
  const parsed = parseRequiredString(value);
  if (parsed.length < minLength || parsed.length > maxLength) {
    throw new Error(`${label} length is invalid`);
  }
  return parsed;
}

function parseStatus(value: ExcelCellValue): user_status {
  const parsed = parseRequiredString(value).toUpperCase();
  const statuses: Record<string, user_status> = {
    ACTIVE: user_status.ACTIVE,
    INACTIVE: user_status.INACTIVE,
    'ĐANG HOẠT ĐỘNG': user_status.ACTIVE,
    'ĐÃ KHÓA': user_status.INACTIVE,
  };
  const status = statuses[parsed];
  if (!status) throw new Error('Status is invalid');
  return status;
}

function parseOptionalString(value: ExcelCellValue) {
  if (value === null) return null;
  return String(value).trim() || null;
}
