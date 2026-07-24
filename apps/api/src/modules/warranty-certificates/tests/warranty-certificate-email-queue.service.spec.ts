import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
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
        product: {
          name: 'Lexzenz Film',
          ownerships: [],
          serial_number: 'SN-001',
        },
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
      prismaService as never,
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
  });
});
