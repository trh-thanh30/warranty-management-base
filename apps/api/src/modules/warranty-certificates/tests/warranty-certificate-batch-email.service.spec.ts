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

  it.each([
    ['en', 'Electronic warranty certificates (2 products)', 'Hello Thanh,'],
    ['vi', 'Chứng nhận bảo hành điện tử (2 sản phẩm)', 'Xin chào Thanh,'],
  ] as const)(
    'localizes aggregate email copy for %s',
    async (locale, subject, greeting) => {
      const { service, sendEmailUseCase } = createService({ locale });

      await service.queueEmail({
        certificateIds: ['certificate-1', 'certificate-2'],
        recipientEmail: 'customer@example.com',
        requestId: 'request-id',
      });

      expect(sendEmailUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          subject,
          text: expect.stringContaining(greeting),
          context: expect.objectContaining({ locale }),
        }),
      );
      expect(sendEmailUseCase.execute.mock.calls[0][0].text).toContain(
        locale === 'en'
          ? 'The certificate PDF files are attached to this email.'
          : 'Các file chứng nhận PDF được đính kèm trong email này.',
      );
    },
  );

  it('falls back to Vietnamese when request locale is missing or unsupported', async () => {
    const { service, sendEmailUseCase } = createService({ locale: 'fr' });

    await service.queueEmail({
      certificateIds: ['certificate-1', 'certificate-2'],
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });

    expect(sendEmailUseCase.execute.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        subject: 'Chứng nhận bảo hành điện tử (2 sản phẩm)',
        context: expect.objectContaining({ locale: 'vi' }),
      }),
    );
  });
});

function createService(input: { locale?: string }) {
  const certificates = [
    buildCertificate('certificate-1', 'CERT-001', 'one.pdf'),
    buildCertificate('certificate-2', 'CERT-002', 'two.pdf'),
  ];
  const prismaService = {
    warrantyActivationRequest: {
      findUnique: jest.fn().mockResolvedValue({
        customer_name: 'Thanh',
        metadata: input.locale ? { locale: input.locale } : null,
      }),
    },
    warrantyCertificate: {
      findMany: jest.fn().mockResolvedValue(certificates),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  const sendEmailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
  const uploadAssetService = {
    getStream: jest
      .fn()
      .mockResolvedValueOnce(Readable.from(Buffer.from('pdf-one')))
      .mockResolvedValueOnce(Readable.from(Buffer.from('pdf-two'))),
  };

  return {
    service: new WarrantyCertificateBatchEmailService(
      new WarrantyCertificatesRepository(prismaService as never),
      sendEmailUseCase as never,
      uploadAssetService as never,
    ),
    sendEmailUseCase,
  };
}

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
