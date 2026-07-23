import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';

export type WarrantyCertificateEmailInput = {
  certificateNumber: string;
  customerAddress?: string | null;
  customerEmail?: string | null;
  customerName: string;
  customerPhone?: string | null;
  dealerName?: string | null;
  endDate: Date | null;
  filmItems?: Record<string, string> | null;
  installedAt?: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
  warrantyDurationMonths?: number | null;
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
      `Biển số xe: ${input.vehiclePlate ?? '-'}`,
      `Loại xe: ${input.vehicleModel ?? '-'}`,
      `Sản phẩm: ${input.productName}`,
      `Số serial: ${input.serialNumber ?? '-'}`,
      `Đại lý: ${input.dealerName ?? '-'}`,
      `Thời hạn: ${formatWarrantyCertificateDate(input.startDate)} - ${formatWarrantyCertificateDate(input.endDate)}`,
      '',
      'Vui lòng lưu email này để đối chiếu khi cần hỗ trợ bảo hành.',
    ].join('\n');
  }

  buildTemplateContext(input: WarrantyCertificateEmailInput) {
    const subject = this.buildSubject(input);

    return {
      certificateNumber: input.certificateNumber,
      customerAddress: input.customerAddress ?? '-',
      customerEmail: input.customerEmail ?? '-',
      customerName: input.customerName,
      customerPhone: input.customerPhone ?? '-',
      dealerName: input.dealerName ?? '-',
      endDate: formatWarrantyCertificateDate(input.endDate),
      filmItems: {
        frontLeftSide: input.filmItems?.frontLeftSide ?? '-',
        frontRightSide: input.filmItems?.frontRightSide ?? '-',
        rearGlass: input.filmItems?.rearGlass ?? '-',
        rearLeftSide: input.filmItems?.rearLeftSide ?? '-',
        rearRightSide: input.filmItems?.rearRightSide ?? '-',
        sunroof: input.filmItems?.sunroof ?? '-',
        windshield: input.filmItems?.windshield ?? '-',
      },
      installedAt: formatWarrantyCertificateDate(
        input.installedAt ?? input.startDate,
      ),
      productName: input.productName,
      serialNumber: input.serialNumber ?? '-',
      startDate: formatWarrantyCertificateDate(input.startDate),
      subject,
      vehicleModel: input.vehicleModel ?? '-',
      vehiclePlate: input.vehiclePlate ?? '-',
      warrantyDurationMonths: input.warrantyDurationMonths ?? '-',
      warrantyCode: input.warrantyCode ?? '-',
    };
  }
}
