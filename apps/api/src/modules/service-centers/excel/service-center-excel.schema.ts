import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { ServiceCenterExcelRow } from '@/modules/service-centers/excel/service-center-excel.types';

export const serviceCenterExcelColumns: Array<
  ExcelColumnDefinition<ServiceCenterExcelRow>
> = [
  {
    key: 'name',
    header: 'Tên trạm bảo hành',
    required: true,
    width: 34,
    example: 'Trạm bảo hành Đà Nẵng',
    parse: (value) => parseRequiredString(value, 160),
  },
  {
    key: 'phone',
    header: 'Số điện thoại',
    width: 22,
    example: '0901234567',
    note: 'Mỗi dòng phải có ít nhất số điện thoại hoặc email. Số điện thoại được dùng để cập nhật trạm đã có.',
    parse: parsePhone,
  },
  {
    key: 'email',
    header: 'Email',
    width: 32,
    example: 'danang@example.com',
    note: 'Mỗi dòng phải có ít nhất số điện thoại hoặc email. Email được dùng để cập nhật trạm đã có.',
    parse: parseEmail,
  },
  {
    key: 'province',
    header: 'Tỉnh hoặc thành phố',
    required: true,
    width: 28,
    example: 'Đà Nẵng',
    parse: (value) => parseRequiredString(value, 120),
  },
  {
    key: 'district',
    header: 'Phường hoặc xã',
    width: 28,
    example: 'Phường Hải Châu',
    parse: (value) => parseOptionalString(value, 120),
  },
  {
    key: 'address',
    header: 'Địa chỉ chi tiết',
    required: true,
    width: 42,
    example: '1 Nguyễn Văn Linh',
    parse: (value) => parseRequiredString(value, 255, 4),
  },
  {
    key: 'latitude',
    header: 'Vĩ độ',
    required: true,
    width: 18,
    example: 16.0544,
    note: 'Giá trị từ -90 đến 90.',
    parse: (value) => parseCoordinate(value, -90, 90, 'Vĩ độ'),
  },
  {
    key: 'longitude',
    header: 'Kinh độ',
    required: true,
    width: 18,
    example: 108.2022,
    note: 'Giá trị từ -180 đến 180.',
    parse: (value) => parseCoordinate(value, -180, 180, 'Kinh độ'),
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
];

function parsePhone(value: ExcelCellValue) {
  const parsed =
    parseOptionalString(value, 32)?.replace(/[s().-]/g, '') ?? null;
  if (parsed && !/^\+?\d{8,15}$/.test(parsed)) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return parsed;
}

function parseEmail(value: ExcelCellValue) {
  const parsed = parseOptionalString(value)?.toLowerCase() ?? null;
  if (parsed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) {
    throw new Error('Email không hợp lệ');
  }
  return parsed;
}

function parseCoordinate(
  value: ExcelCellValue,
  min: number,
  max: number,
  label: string,
) {
  const parsed = Number(String(value ?? '').trim());
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} phải nằm trong khoảng ${min} đến ${max}`);
  }
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

function parseRequiredString(
  value: ExcelCellValue,
  maxLength: number,
  minLength = 2,
) {
  const parsed = parseOptionalString(value, maxLength);
  if (!parsed || parsed.length < minLength) {
    throw new Error(`Giá trị phải có ít nhất ${minLength} ký tự`);
  }
  return parsed;
}

function parseOptionalString(value: ExcelCellValue, maxLength?: number) {
  const parsed = value === null ? null : String(value).trim() || null;
  if (parsed && maxLength && parsed.length > maxLength) {
    throw new Error(`Giá trị không được quá ${maxLength} ký tự`);
  }
  return parsed;
}
