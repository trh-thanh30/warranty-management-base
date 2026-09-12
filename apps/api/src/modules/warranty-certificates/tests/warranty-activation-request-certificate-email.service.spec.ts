import EmailConfig from '@/config/email.config';
import ClientConfig from '@/config/client.config';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import {
  SendEmailParams,
  SendEmailUseCase,
} from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { Test } from '@nestjs/testing';
import { Readable } from 'node:stream';

describe('WarrantyActivationRequestCertificateEmailService', () => {
  it('records queue failure separately while retaining the PDF error', async () => {
    const certificate = {
      id: 'failed-certificate',
      status: 'FAILED',
      emailStatus: 'PENDING',
      lastError: 'PDF_RENDERER_UNAVAILABLE',
      recipientEmail: 'customer@example.com',
      request: { customerName: 'Nguyễn Văn A', items: [] },
    };
    const repository = {
      findEmailDataById: jest.fn().mockResolvedValue(certificate),
      update: jest.fn().mockResolvedValue(certificate),
    };
    const sendEmail = {
      execute: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
    };
    const module = await Test.createTestingModule({
      providers: [
        WarrantyActivationRequestCertificateEmailService,
        {
          provide: WarrantyActivationRequestCertificatesRepository,
          useValue: repository,
        },
        { provide: SendEmailUseCase, useValue: sendEmail },
        { provide: UploadAssetService, useValue: { getStream: jest.fn() } },
        { provide: EmailConfig.KEY, useValue: {} },
        {
          provide: ClientConfig.KEY,
          useValue: {
            warrantyLookupUrl: 'https://portal.example.com/vi/warranty/lookup',
          },
        },
      ],
    }).compile();
    await expect(
      module
        .get(WarrantyActivationRequestCertificateEmailService)
        .queueEmail('failed-certificate'),
    ).rejects.toThrow('Redis unavailable');
    expect(repository.update).toHaveBeenLastCalledWith('failed-certificate', {
      emailStatus: 'FAILED',
      lastError: 'PDF_RENDERER_UNAVAILABLE | Email: Redis unavailable',
    });
  });
  it.each([
    ['PENDING', false, 1],
    ['QUEUED', false, 0],
    ['SENT', false, 0],
    ['SENT', true, 1],
  ])(
    'queues PDF-free confirmation for %s (force=%s) without duplicates',
    async (emailStatus, force, expectedCalls) => {
      const certificate = {
        id: 'failed-certificate',
        activationRequestId: 'request-1',
        certificateNumber: 'CERT-FAILED',
        recipientEmail: 'customer@example.com',
        storageKey: null,
        status: 'FAILED',
        emailStatus,
        lastError: 'PDF_RENDERER_UNAVAILABLE',
        request: {
          customerName: 'Nguyễn Văn A',
          items: [
            {
              positionLabel: 'Kính lái',
              productName: 'Film A',
              serialNumber: null,
              warrantyCode: 'WM-2026-ABC123',
            },
          ],
        },
      };
      const repository = {
        findEmailDataById: jest.fn().mockResolvedValue(certificate),
        findByRequestId: jest.fn().mockResolvedValue(certificate),
        update: jest
          .fn()
          .mockImplementation((_id, data) =>
            Promise.resolve({ ...certificate, ...data }),
          ),
      };
      const sendEmail = {
        execute: jest.fn<Promise<void>, [SendEmailParams]>(),
      };
      const upload = { getStream: jest.fn() };
      const module = await Test.createTestingModule({
        providers: [
          WarrantyActivationRequestCertificateEmailService,
          {
            provide: WarrantyActivationRequestCertificatesRepository,
            useValue: repository,
          },
          { provide: SendEmailUseCase, useValue: sendEmail },
          { provide: UploadAssetService, useValue: upload },
          { provide: EmailConfig.KEY, useValue: {} },
          {
            provide: ClientConfig.KEY,
            useValue: {
              warrantyLookupUrl:
                'https://portal.example.com/vi/warranty/lookup',
            },
          },
        ],
      }).compile();
      await module
        .get(WarrantyActivationRequestCertificateEmailService)
        .queueEmail('failed-certificate', { force });
      expect(sendEmail.execute).toHaveBeenCalledTimes(expectedCalls);
      expect(upload.getStream).not.toHaveBeenCalled();
      if (expectedCalls) {
        const email = sendEmail.execute.mock.calls[0]?.[0];
        expect(email?.attachments).toBeUndefined();
        expect(email?.context).toMatchObject({
          withoutPdf: true,
          lookupUrl: 'https://portal.example.com/vi/warranty/lookup',
        });
        expect(email?.text).toContain('WM-2026-ABC123');
        expect(email?.text).toContain(
          'https://portal.example.com/vi/warranty/lookup',
        );
        expect(email?.text).not.toContain('Chứng nhận bảo hành được đính kèm');
        expect(repository.update).toHaveBeenCalledWith(
          'failed-certificate',
          expect.objectContaining({
            emailStatus: 'QUEUED',
            lastError: 'PDF_RENDERER_UNAVAILABLE',
            emailedAt: null,
          }),
        );
        expect(repository.update.mock.invocationCallOrder[0]).toBeLessThan(
          sendEmail.execute.mock.invocationCallOrder[0],
        );
      }
    },
  );
  it('queues one PDF attachment containing every request item', async () => {
    const certificate = {
      activationRequestId: 'request-1',
      emailStatus: 'PENDING',
      lastError: null,
      status: 'GENERATED',
      id: 'request-certificate-1',
      certificateNumber: 'CERT-2026-ABC',
      recipientEmail: 'customer@example.com',
      storageKey: 'private/certificate.pdf',
      request: {
        customerName: 'Nguyễn Văn A',
        items: [
          {
            positionLabel: 'Kính lái',
            productName: 'SP50',
            serialNumber: 'SERIAL-1',
            warrantyCode: 'WM-SP50',
          },
          {
            positionLabel: 'Cửa sổ trời',
            productName: 'B55',
            serialNumber: null,
            warrantyCode: 'WM-B55',
          },
        ],
      },
    };
    const repository: jest.Mocked<
      Pick<
        WarrantyActivationRequestCertificatesRepository,
        'findEmailDataById' | 'update'
      >
    > = {
      findEmailDataById: jest.fn().mockResolvedValue(certificate),
      update: jest
        .fn()
        .mockImplementation((_id, data) =>
          Promise.resolve({ ...certificate, ...data }),
        ),
    };
    const sendEmail: jest.Mocked<Pick<SendEmailUseCase, 'execute'>> = {
      execute: jest.fn<Promise<void>, [SendEmailParams]>(),
    };
    const upload: jest.Mocked<Pick<UploadAssetService, 'getStream'>> = {
      getStream: jest.fn().mockResolvedValue(Readable.from(Buffer.from('pdf'))),
    };
    const module = await Test.createTestingModule({
      providers: [
        WarrantyActivationRequestCertificateEmailService,
        {
          provide: WarrantyActivationRequestCertificatesRepository,
          useValue: repository,
        },
        { provide: SendEmailUseCase, useValue: sendEmail },
        { provide: UploadAssetService, useValue: upload },
        {
          provide: ClientConfig.KEY,
          useValue: {
            warrantyLookupUrl: 'https://portal.example.com/vi/warranty/lookup',
          },
        },
        {
          provide: EmailConfig.KEY,
          useValue: {
            brandLogoUrl: 'https://cdn.example.com/brand-logo.png',
          },
        },
      ],
    }).compile();
    const service = module.get(
      WarrantyActivationRequestCertificateEmailService,
    );

    await service.queueEmail('request-certificate-1');

    const email = sendEmail.execute.mock.calls[0]?.[0];
    expect(email?.attachments?.[0]?.filename).toBe('CERT-2026-ABC.pdf');
    expect(email?.context).toEqual({
      brandLogoUrl: 'https://cdn.example.com/brand-logo.png',
      certificateCount: 2,
      certificateNumber: 'CERT-2026-ABC',
      certificates: [
        {
          positionLabel: 'Kính lái',
          productName: 'SP50',
          warrantyCode: 'WM-SP50',
        },
        {
          positionLabel: 'Cửa sổ trời',
          productName: 'B55',
          warrantyCode: 'WM-B55',
        },
      ],
      customerName: 'Nguyễn Văn A',
      subject: 'Chứng nhận bảo hành điện tử CERT-2026-ABC',
      withoutPdf: false,
      lookupUrl: 'https://portal.example.com/vi/warranty/lookup',
    });
    expect(email?.text).toMatch(/WM-SP50[\s\S]*WM-B55/);
    expect(email?.text).toContain(
      'https://portal.example.com/vi/warranty/lookup',
    );
    expect(email?.warrantyActivationRequestCertificateId).toBe(
      'request-certificate-1',
    );

    const update = repository.update.mock.calls[0];
    expect(update?.[0]).toBe('request-certificate-1');
    expect(update?.[1]).toEqual(
      expect.objectContaining({ emailStatus: 'QUEUED', lastError: null }),
    );
  });
});
