import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
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
    const repository = {
      findEmailDataById: jest.fn().mockResolvedValue(certificate),
      update: jest
        .fn()
        .mockImplementation((_id, data) =>
          Promise.resolve({ ...certificate, ...data }),
        ),
    };
    const sendEmail = { execute: jest.fn().mockResolvedValue(undefined) };
    const upload = {
      getStream: jest.fn().mockResolvedValue(Readable.from(Buffer.from('pdf'))),
    };
    const service = new WarrantyActivationRequestCertificateEmailService(
      repository as never,
      sendEmail as never,
      upload as never,
    );

    await service.queueEmail('request-certificate-1');

    expect(sendEmail.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({ filename: 'CERT-2026-ABC.pdf' }),
        ],
        context: expect.objectContaining({
          certificateCount: 2,
          certificates: [
            {
              certificateNumber: 'CERT-2026-ABC',
              productName: 'Kính lái: SP50',
              warrantyCode: 'WM-SP50',
            },
            {
              certificateNumber: 'CERT-2026-ABC',
              productName: 'Cửa sổ trời: B55',
              warrantyCode: 'WM-B55',
            },
          ],
        }),
        text: expect.stringMatching(/WM-SP50[\s\S]*WM-B55/),
        warrantyActivationRequestCertificateId: 'request-certificate-1',
      }),
    );
    expect(repository.update).toHaveBeenCalledWith(
      'request-certificate-1',
      expect.objectContaining({ email_status: 'QUEUED', last_error: null }),
    );
  });
});
