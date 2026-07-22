import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { CustomerExcelRow } from '@/modules/customers/excel/customer-excel.types';

export const customerExcelColumns: Array<
  ExcelColumnDefinition<CustomerExcelRow>
> = [
  {
    key: 'customerCode',
    header: 'Mã khách hàng',
    width: 22,
    example: 'CUS000001',
    note: 'Không bắt buộc. Nếu bỏ trống, hệ thống tự sinh mã khi tạo mới.',
    parse: parseOptionalString,
  },
  {
    key: 'fullName',
    header: 'Họ và tên',
    required: true,
    width: 30,
    example: 'Nguyễn Văn A',
    parse: parseRequiredString,
  },
  {
    key: 'phone',
    header: 'Số điện thoại',
    required: true,
    width: 22,
    example: '0901234567',
    parse: parseRequiredString,
  },
  {
    key: 'email',
    header: 'Email',
    required: true,
    width: 32,
    example: 'khachhang@example.com',
    parse: parseEmail,
  },
  {
    key: 'address',
    header: 'Địa chỉ',
    required: true,
    width: 48,
    example: 'Số 1 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    parse: parseRequiredString,
  },
];

function parseRequiredString(value: ExcelCellValue) {
  const parsed = parseOptionalString(value);
  if (!parsed) {
    throw new Error('Value is required');
  }

  return parsed;
}

function parseEmail(value: ExcelCellValue) {
  const parsed = parseRequiredString(value).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) {
    throw new Error('Email is invalid');
  }

  return parsed;
}

function parseOptionalString(value: ExcelCellValue) {
  if (value === null) {
    return null;
  }

  return String(value).trim() || null;
}
