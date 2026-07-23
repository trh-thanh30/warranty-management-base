import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  asset_access_type,
  warranty_certificate_email_status,
  warranty_certificate_status,
} from '@prisma/client';
import { Readable } from 'stream';

const CERTIFICATE_NUMBER_GENERATION_ATTEMPTS = 3;

@Injectable()
export class IssueWarrantyCertificateUseCase {
  private readonly logger = new Logger(IssueWarrantyCertificateUseCase.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(input: {
    recipientEmail?: string;
    warrantyId: string;
    requestId?: string;
  }) {
    const warranty = await this.prismaService.warranty.findUnique({
      where: { id: input.warrantyId },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              include: { customer: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!warranty) {
      throw new Error('Warranty not found while issuing certificate');
    }
    const currentCustomer = warranty.product.ownerships[0]?.customer;
    const recipientEmail = (
      input.recipientEmail ??
      currentCustomer?.email ??
      ''
    )
      .trim()
      .toLowerCase();
    if (!recipientEmail) {
      throw new Error('Warranty certificate recipient email is required');
    }

    const existingCertificate =
      await this.prismaService.warrantyCertificate.findFirst({
        where: { warranty_id: warranty.id },
        orderBy: { created_at: 'desc' },
      });

    if (existingCertificate) {
      return existingCertificate;
    }

    const certificate = await this.createGeneratedCertificate({
      recipientEmail,
      requestId: input.requestId,
      warrantyCode: warranty.warranty_code,
      warrantyId: warranty.id,
    });

    try {
      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: createCertificatePdfBuffer({
              certificateNumber: certificate.certificate_number,
              customerName: currentCustomer?.full_name ?? 'Quy khach',
              endDate: warranty.end_date,
              productName: warranty.product.name,
              serialNumber: warranty.product.serial_number,
              startDate: warranty.start_date,
              warrantyCode: warranty.warranty_code,
            }).toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificate_number}.pdf`,
          },
        ],
        to: recipientEmail,
        subject: `Chứng nhận bảo hành điện tử ${certificate.certificate_number}`,
        text: buildCertificateEmailText({
          certificateNumber: certificate.certificate_number,
          customerName: currentCustomer?.full_name ?? 'Quý khách',
          endDate: warranty.end_date,
          productName: warranty.product.name,
          serialNumber: warranty.product.serial_number,
          startDate: warranty.start_date,
          warrantyCode: warranty.warranty_code,
        }),
        html: buildCertificateEmailHtml({
          certificateNumber: certificate.certificate_number,
          customerName: currentCustomer?.full_name ?? 'Quý khách',
          endDate: warranty.end_date,
          productName: warranty.product.name,
          serialNumber: warranty.product.serial_number,
          startDate: warranty.start_date,
          warrantyCode: warranty.warranty_code,
        }),
      });

      return this.prismaService.warrantyCertificate.update({
        where: { id: certificate.id },
        data: {
          email_status: warranty_certificate_email_status.QUEUED,
          emailed_at: new Date(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue warranty certificate email ${certificate.id}: ${message}`,
      );

      return this.prismaService.warrantyCertificate.update({
        where: { id: certificate.id },
        data: {
          email_status: warranty_certificate_email_status.FAILED,
          last_error: message,
        },
      });
    }
  }

  private async createGeneratedCertificate(input: {
    recipientEmail: string;
    requestId?: string;
    warrantyCode: string | null;
    warrantyId: string;
  }) {
    const warranty = await this.prismaService.warranty.findUnique({
      where: { id: input.warrantyId },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              include: { customer: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!warranty) {
      throw new Error('Warranty not found while generating certificate PDF');
    }

    for (
      let attempt = 0;
      attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      try {
        const certificateNumber = generateCertificateNumber();
        const pdfBuffer = createCertificatePdfBuffer({
          certificateNumber,
          customerName:
            warranty.product.ownerships[0]?.customer.full_name ?? 'Quy khach',
          endDate: warranty.end_date,
          productName: warranty.product.name,
          serialNumber: warranty.product.serial_number,
          startDate: warranty.start_date,
          warrantyCode: input.warrantyCode,
        });
        const uploadedPdf = await this.uploadAssetService.upload(
          {
            buffer: pdfBuffer,
            destination: '',
            encoding: '7bit',
            fieldname: 'file',
            filename: `${certificateNumber}.pdf`,
            mimetype: 'application/pdf',
            originalname: `${certificateNumber}.pdf`,
            path: '',
            size: pdfBuffer.byteLength,
            stream: Readable.from(pdfBuffer),
          },
          {
            accessType: asset_access_type.PRIVATE,
            folder: 'warranty-certificates',
          },
        );

        return await this.prismaService.warrantyCertificate.create({
          data: {
            certificate_number: certificateNumber,
            email_status: warranty_certificate_email_status.PENDING,
            generated_at: new Date(),
            metadata: {
              requestId: input.requestId,
              warrantyCode: input.warrantyCode,
            },
            recipient_email: input.recipientEmail,
            status: warranty_certificate_status.GENERATED,
            storage_key: uploadedPdf.path,
            warranty: { connect: { id: input.warrantyId } },
          },
        });
      } catch (error) {
        if (
          attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS - 1 &&
          isCertificateNumberConflict(error)
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Could not generate a unique warranty certificate number');
  }
}

function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CERT-${year}-${suffix}`;
}

function isCertificateNumberConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes('certificate_number')
  );
}

function buildCertificateEmailText(input: CertificateEmailInput) {
  return [
    `Xin chào ${input.customerName},`,
    '',
    `Chứng nhận bảo hành điện tử ${input.certificateNumber} đã được tạo cho mã bảo hành ${input.warrantyCode ?? '-'}.`,
    `Sản phẩm: ${input.productName}`,
    `Số serial: ${input.serialNumber ?? '-'}`,
    `Thời hạn: ${formatDate(input.startDate)} - ${formatDate(input.endDate)}`,
    '',
    'Vui lòng lưu email này để đối chiếu khi cần hỗ trợ bảo hành.',
  ].join('\n');
}

function buildCertificateEmailHtml(input: CertificateEmailInput) {
  return `
    <p>Xin chào ${escapeHtml(input.customerName)},</p>
    <p>Chứng nhận bảo hành điện tử <strong>${escapeHtml(input.certificateNumber)}</strong> đã được tạo cho mã bảo hành <strong>${escapeHtml(input.warrantyCode ?? '-')}</strong>.</p>
    <ul>
      <li>Sản phẩm: ${escapeHtml(input.productName)}</li>
      <li>Số serial: ${escapeHtml(input.serialNumber ?? '-')}</li>
      <li>Thời hạn: ${escapeHtml(formatDate(input.startDate))} - ${escapeHtml(formatDate(input.endDate))}</li>
    </ul>
    <p>Vui lòng lưu email này để đối chiếu khi cần hỗ trợ bảo hành.</p>
  `;
}

type CertificateEmailInput = {
  certificateNumber: string;
  customerName: string;
  endDate: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  warrantyCode: string | null;
};

function formatDate(value: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createCertificatePdfBuffer(input: CertificateEmailInput) {
  const lines = [
    'Electronic Warranty Certificate',
    `Certificate: ${input.certificateNumber}`,
    `Warranty code: ${input.warrantyCode ?? '-'}`,
    `Customer: ${input.customerName}`,
    `Product: ${input.productName}`,
    `Serial: ${input.serialNumber ?? '-'}`,
    `Coverage: ${formatDate(input.startDate)} - ${formatDate(input.endDate)}`,
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

function escapePdfText(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}
