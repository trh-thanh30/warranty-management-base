import { PrismaService } from '@/database/prisma/prisma.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { Injectable, Logger } from '@nestjs/common';
import { warranty_certificate_email_status } from '@prisma/client';

@Injectable()
export class WarrantyCertificateEmailQueueService {
  private readonly logger = new Logger(
    WarrantyCertificateEmailQueueService.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly emailContentService: WarrantyCertificateEmailContentService,
    private readonly pdfService: WarrantyCertificatePdfService,
  ) {}

  async queueEmail(certificateId: string) {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
        where: { id: certificateId },
        include: {
          warranty: {
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
          },
        },
      },
    );

    if (!certificate) {
      throw new Error('Warranty certificate not found while queueing email');
    }

    const currentCustomer =
      certificate.warranty.product.ownerships[0]?.customer;
    const emailInput = {
      certificateNumber: certificate.certificate_number,
      customerName: currentCustomer?.full_name ?? 'Quý khách',
      endDate: certificate.warranty.end_date,
      productName: certificate.warranty.product.name,
      serialNumber: certificate.warranty.product.serial_number,
      startDate: certificate.warranty.start_date,
      warrantyCode: certificate.warranty.warranty_code,
    };

    try {
      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: this.pdfService
              .createPdfBuffer(emailInput)
              .toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificate_number}.pdf`,
          },
        ],
        context: this.emailContentService.buildTemplateContext(emailInput),
        template: 'warranty-certificate',
        to: certificate.recipient_email,
        subject: this.emailContentService.buildSubject(emailInput),
        text: this.emailContentService.buildText(emailInput),
        warrantyCertificateId: certificate.id,
      });

      return this.prismaService.warrantyCertificate.update({
        where: { id: certificate.id },
        data: {
          email_status: warranty_certificate_email_status.QUEUED,
          emailed_at: new Date(),
          last_error: null,
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
}
