import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';

export type WarrantyCertificatePdfInput = {
  certificateNumber: string;
  customerName: string;
  endDate: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  warrantyCode: string | null;
};

@Injectable()
export class WarrantyCertificatePdfService {
  createPdfBuffer(input: WarrantyCertificatePdfInput) {
    const lines = [
      'Electronic Warranty Certificate',
      `Certificate: ${input.certificateNumber}`,
      `Warranty code: ${input.warrantyCode ?? '-'}`,
      `Customer: ${input.customerName}`,
      `Product: ${input.productName}`,
      `Serial: ${input.serialNumber ?? '-'}`,
      `Coverage: ${formatWarrantyCertificateDate(input.startDate)} - ${formatWarrantyCertificateDate(input.endDate)}`,
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
