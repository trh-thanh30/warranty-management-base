import EmailConfig from '@/config/email.config';
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
  it('queues one PDF attachment containing every request item', async () => {
    const certificate = {
      id: 'request-certificate-1',
      certificate_number: 'CERT-2026-ABC',
      recipient_email: 'customer@example.com',
      storage_key: 'private/certificate.pdf',
      activation_request: {
        customer_name: 'Nguyễn Văn A',
        items: [
          {
            position_label: 'Kính lái',
            product_name: 'SP50',
            serial_number: 'SERIAL-1',
            warranty_code: 'WM-SP50',
          },
          {
            position_label: 'Cửa sổ trời',
            product_name: 'B55',
            serial_number: null,
            warranty_code: 'WM-B55',
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
    });
    expect(email?.text).toMatch(/WM-SP50[\s\S]*WM-B55/);
    expect(email?.warrantyActivationRequestCertificateId).toBe(
      'request-certificate-1',
    );

    const update = repository.update.mock.calls[0];
    expect(update?.[0]).toBe('request-certificate-1');
    expect(update?.[1]).toEqual(
      expect.objectContaining({ email_status: 'QUEUED', last_error: null }),
    );
  });
});
