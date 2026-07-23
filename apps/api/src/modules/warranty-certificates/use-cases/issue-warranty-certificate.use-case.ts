import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import {
  generateCertificateNumber,
  isCertificateNumberConflict,
} from '@/modules/warranty-certificates/utils/warranty-certificate-number.util';
import { Injectable, Logger } from '@nestjs/common';
import {
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
    private readonly uploadAssetService: UploadAssetService,
    private readonly certificateEmailQueueService: WarrantyCertificateEmailQueueService,
    private readonly pdfService: WarrantyCertificatePdfService,
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

    return this.certificateEmailQueueService.queueEmail(certificate.id);
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
        const pdfBuffer = this.pdfService.createPdfBuffer({
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
