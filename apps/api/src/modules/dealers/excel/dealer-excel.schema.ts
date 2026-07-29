import { ExcelCellValue, ExcelColumnDefinition } from '@/common/excel';
import { DealerExcelRow } from '@/modules/dealers/excel/dealer-excel.types';

export const dealerExcelColumns: Array<ExcelColumnDefinition<DealerExcelRow>> =
  [
    {
      key: 'name',
      header: 'Tên đại lý',
      required: true,
      width: 34,
      example: 'Đại lý Lexzenz Hà Nội',
      parse: (value) => parseRequiredString(value, 160),
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      width: 22,
      example: '0901234567',
      note: 'Nếu số điện thoại đã tồn tại, dòng import sẽ cập nhật đại lý đó.',
      parse: parsePhone,
    },
    {
      key: 'province',
      header: 'Tỉnh hoặc thành phố',
      required: true,
      width: 28,
      example: 'Thành phố Hà Nội',
      parse: (value) => parseRequiredString(value, 120),
    },
    {
      key: 'district',
      header: 'Phường hoặc xã',
      width: 28,
      example: 'Phường Thanh Xuân',
      parse: (value) => parseOptionalString(value, 120),
    },
    {
      key: 'address',
      header: 'Địa chỉ',
      required: true,
      width: 42,
      example: '12 Nguyễn Trãi, Thanh Xuân',
      parse: (value) => parseRequiredString(value, 255, 4),
    },
    {
      key: 'salesName',
      header: 'NV sale',
      width: 24,
      example: 'Nguyễn Văn A',
      parse: (value) => parseOptionalString(value, 120),
    },
    {
      key: 'latitude',
      header: 'Vĩ độ',
      required: true,
      width: 18,
      example: 21.0285,
      note: 'Giá trị từ -90 đến 90.',
      parse: (value) => parseCoordinate(value, -90, 90, 'Vĩ độ'),
    },
    {
      key: 'longitude',
      header: 'Kinh độ',
      required: true,
      width: 18,
      example: 105.8542,
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
      format: (value) =>
        value === true ? 'Đang hoạt động' : 'Ngưng hoạt động',
    },
  ];

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

function parsePhone(value: ExcelCellValue) {
  const parsed =
    parseOptionalString(value, 32)?.replace(/[\s().-]/g, '') ?? null;
  if (parsed && !/^\+?\d{8,15}$/.test(parsed)) {
    throw new Error('Số điện thoại không hợp lệ');
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
