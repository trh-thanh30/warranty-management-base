import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';

export type WarrantyCertificatePdfInput = {
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
export class WarrantyCertificatePdfService {
  createPdfBuffer(input: WarrantyCertificatePdfInput) {
    const lines = [
      'CHUNG NHAN BAO HANH DIEN TU',
      `Warranty number: ${input.certificateNumber}`,
      '',
      'THONG TIN KHACH HANG',
      `Bien so xe: ${input.vehiclePlate ?? '-'}`,
      `Loai xe: ${input.vehicleModel ?? '-'}`,
      `So serial: ${input.serialNumber ?? '-'}`,
      `Ten khach hang: ${input.customerName}`,
      `So dien thoai: ${input.customerPhone ?? '-'}`,
      `Email: ${input.customerEmail ?? '-'}`,
      `Dia chi: ${input.customerAddress ?? '-'}`,
      '',
      'THONG TIN SAN PHAM',
      `Dai ly: ${input.dealerName ?? '-'}`,
      `Ngay lap dat: ${formatWarrantyCertificateDate(input.installedAt ?? input.startDate)}`,
      `Ten goi dan: ${input.productName}`,
      `Kinh lai: ${input.filmItems?.windshield ?? '-'}`,
      `KST - Trai: ${input.filmItems?.frontLeftSide ?? '-'}`,
      `KST - Phai: ${input.filmItems?.frontRightSide ?? '-'}`,
      `KSS - Trai: ${input.filmItems?.rearLeftSide ?? '-'}`,
      `KSS - Phai: ${input.filmItems?.rearRightSide ?? '-'}`,
      `Cua so troi: ${input.filmItems?.sunroof ?? '-'}`,
      `Kinh lung: ${input.filmItems?.rearGlass ?? '-'}`,
      `Thoi gian bao hanh: ${input.warrantyDurationMonths ?? '-'} thang`,
      `Ngay het han bao hanh: ${formatWarrantyCertificateDate(input.endDate)}`,
      `Ma bao hanh: ${input.warrantyCode ?? '-'}`,
    ];
    const textCommands = lines
      .map(
        (line, index) =>
          `BT /F1 12 Tf 56 ${760 - index * 24} Td (${escapePdfText(line)}) Tj ET`,
      )
      .join('\n');
    const content = `${textCommands}\n`;
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(content, 'utf8')} >> stream\n${content}endstream endobj`,
    ];
    let body = '%PDF-1.4\n';
    const offsets = [0];

    for (const object of objects) {
      offsets.push(Buffer.byteLength(body, 'utf8'));
      body += `${object}\n`;
    }

    const xrefOffset = Buffer.byteLength(body, 'utf8');
    body += `xref\n0 ${objects.length + 1}\n`;
    body += '0000000000 65535 f \n';
    for (const offset of offsets.slice(1)) {
      body += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }
    body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    body += `startxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(body, 'utf8');
  }
}

function escapePdfText(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}
