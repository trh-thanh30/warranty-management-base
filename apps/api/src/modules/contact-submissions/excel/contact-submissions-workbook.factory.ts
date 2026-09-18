import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
  type ExcelColumnDefinition,
} from '@/common/excel';
import type { ContactSubmissionRecord } from '../contact-submissions.types';

type ContactSubmissionExcelRow = {
  fullName: string;
  phone: string;
  consultationTopic: string;
  province: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const topicLabels: Record<string, string> = {
  PRODUCT_CONSULTATION: 'Tư vấn sản phẩm',
  FIND_DEALER: 'Tìm đại lý',
  WARRANTY: 'Bảo hành',
  DEALER_REGISTRATION: 'Đăng ký đại lý',
  OTHER: 'Khác',
};

const statusLabels: Record<ContactSubmissionRecord['status'], string> = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
  ARCHIVED: 'Đã lưu trữ',
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const columns: Array<ExcelColumnDefinition<ContactSubmissionExcelRow>> = [
  { key: 'fullName', header: 'Họ và tên', width: 28 },
  { key: 'phone', header: 'Số điện thoại', width: 20 },
  { key: 'consultationTopic', header: 'Hỗ trợ tư vấn', width: 24 },
  { key: 'province', header: 'Tỉnh / Thành phố', width: 28 },
  { key: 'content', header: 'Nội dung', width: 60 },
  { key: 'status', header: 'Trạng thái', width: 18 },
  { key: 'createdAt', header: 'Ngày gửi', width: 22 },
  { key: 'updatedAt', header: 'Cập nhật lần cuối', width: 22 },
];

export async function createContactSubmissionsExportWorkbook(
  submissions: ContactSubmissionRecord[],
) {
  const workbook = createExcelWorkbook('Xuất lời nhắn liên hệ');
  const worksheet = addDataWorksheet<ContactSubmissionExcelRow>(workbook, {
    name: 'Lời nhắn liên hệ',
    columns,
    rows: submissions.map((submission) => ({
      fullName: submission.full_name,
      phone: submission.phone,
      consultationTopic: submission.consultation_topic
        ? (topicLabels[submission.consultation_topic] ??
          submission.consultation_topic)
        : '',
      province: submission.province_name ?? '',
      content: submission.content,
      status: statusLabels[submission.status],
      createdAt: dateFormatter.format(submission.created_at),
      updatedAt: dateFormatter.format(submission.updated_at),
    })),
  });
  worksheet.getColumn('phone').numFmt = '@';
  return workbookToBuffer(workbook);
}
