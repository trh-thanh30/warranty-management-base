import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';

export type WarrantyCertificateEmailInput = {
  certificateNumber: string;
  customerName: string;
  endDate: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  warrantyCode: string | null;
};

@Injectable()
export class WarrantyCertificateEmailContentService {
  buildSubject(
    input: Pick<WarrantyCertificateEmailInput, 'certificateNumber'>,
  ) {
    return `Chứng nhận bảo hành điện tử ${input.certificateNumber}`;
  }

  buildText(input: WarrantyCertificateEmailInput) {
    return [
      `Xin chào ${input.customerName},`,
      '',
      `Chứng nhận bảo hành điện tử ${input.certificateNumber} đã được tạo cho mã bảo hành ${input.warrantyCode ?? '-'}.`,
      `Sản phẩm: ${input.productName}`,
      `Số serial: ${input.serialNumber ?? '-'}`,
      `Thời hạn: ${formatWarrantyCertificateDate(input.startDate)} - ${formatWarrantyCertificateDate(input.endDate)}`,
      '',
      'Vui lòng lưu email này để đối chiếu khi cần hỗ trợ bảo hành.',
    ].join('\n');
  }

  buildTemplateContext(input: WarrantyCertificateEmailInput) {
    const subject = this.buildSubject(input);

    return {
      certificateNumber: input.certificateNumber,
      customerName: input.customerName,
      endDate: formatWarrantyCertificateDate(input.endDate),
      productName: input.productName,
      serialNumber: input.serialNumber ?? '-',
      startDate: formatWarrantyCertificateDate(input.startDate),
      subject,
      warrantyCode: input.warrantyCode ?? '-',
    };
  }
}
