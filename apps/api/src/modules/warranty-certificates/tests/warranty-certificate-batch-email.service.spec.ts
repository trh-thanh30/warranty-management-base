import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateBatchEmailService } from '@/modules/warranty-certificates/services/warranty-certificate-batch-email.service';
import { warranty_certificate_email_status } from '@prisma/client';
import { Readable } from 'node:stream';

describe('WarrantyCertificateBatchEmailService', () => {
  it('queues one email containing every generated certificate', async () => {
    const certificates = [
      buildCertificate('certificate-1', 'CERT-001', 'one.pdf'),
      buildCertificate('certificate-2', 'CERT-002', 'two.pdf'),
    ];
    const prismaService = {
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue({ customer_name: 'Thanh' }),
      },
      warrantyCertificate: {
        findMany: jest.fn().mockResolvedValue(certificates),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const sendEmailUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const uploadAssetService = {
      getStream: jest
        .fn()
        .mockResolvedValueOnce(Readable.from(Buffer.from('pdf-one')))
        .mockResolvedValueOnce(Readable.from(Buffer.from('pdf-two'))),
    };
    const service = new WarrantyCertificateBatchEmailService(
      new WarrantyCertificatesRepository(prismaService as never),
      sendEmailUseCase as never,
      uploadAssetService as never,
    );

    await service.queueEmail({
      certificateIds: ['certificate-1', 'certificate-2'],
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });

    expect(sendEmailUseCase.execute).toHaveBeenCalledTimes(1);
    expect(sendEmailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({ filename: 'CERT-001.pdf' }),
          expect.objectContaining({ filename: 'CERT-002.pdf' }),
        ],
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyCertificateIds: ['certificate-1', 'certificate-2'],
      }),
    );
    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['certificate-1', 'certificate-2'] },
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: expect.objectContaining({
        email_status: warranty_certificate_email_status.QUEUED,
        last_error: null,
      }),
    });
  });
});

function buildCertificate(id: string, number: string, storageKey: string) {
  return {
    certificate_number: number,
    id,
    storage_key: storageKey,
    warranty: {
      product: {
        display_name: `Product ${number}`,
        serial_number: `SN-${number}`,
        template: { name: `Template ${number}` },
      },
      warranty_code: `WM-${number}`,
    },
  };
}
