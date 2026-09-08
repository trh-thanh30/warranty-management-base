import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Readable } from 'node:stream';

describe('WarrantyCertificateEmailQueueService', () => {
  it('attaches the exact PDF stored for the certificate', async () => {
    const storedPdf = Buffer.from('%PDF-stored-certificate');
    const certificate = {
      certificate_number: 'LEX-2026-0001',
      id: 'certificate-id',
      metadata: { requestId: 'request-id' },
      recipient_email: 'customer@example.com',
      storage_key:
        'private/2026/07/warranty-certificates/stored-certificate.pdf',
      warranty: {
        duration_months: 36,
        end_date: new Date('2029-07-24T00:00:00.000Z'),
        ownerships: [],
        product: {
          display_name: null,
          template: { name: 'Lexzenz Film' },
        },
        serial_number: 'SN-001',
        start_date: new Date('2026-07-24T00:00:00.000Z'),
        warranty_code: 'WM-2026-ABC123',
      },
    };
    const prismaService = {
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warrantyCertificate: {
        findUnique: jest.fn().mockResolvedValue(certificate),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockImplementation(({ data }) => ({
          ...certificate,
          ...data,
        })),
      },
    };
    const sendEmailUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const emailContentService = {
      buildSubject: jest.fn().mockReturnValue('Warranty certificate'),
      buildTemplateContext: jest.fn().mockReturnValue({}),
      buildText: jest.fn().mockReturnValue('Warranty certificate'),
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(Readable.from(storedPdf)),
    };
    const service = new WarrantyCertificateEmailQueueService(
      new WarrantyCertificatesRepository(prismaService as never),
      sendEmailUseCase as never,
      emailContentService,
      uploadAssetService as never,
    );

    await service.queueEmail(certificate.id);

    expect(uploadAssetService.getStream).toHaveBeenCalledWith(
      certificate.storage_key,
    );
    expect(sendEmailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          {
            contentBase64: storedPdf.toString('base64'),
            contentType: 'application/pdf',
            filename: 'LEX-2026-0001.pdf',
          },
        ],
      }),
    );
    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: [certificate.id] },
        email_status: { not: 'SENT' },
      },
      data: {
        email_status: 'QUEUED',
        emailed_at: expect.any(Date),
        last_error: null,
      },
    });
    expect(prismaService.warrantyCertificate.update).not.toHaveBeenCalled();
  });
});
