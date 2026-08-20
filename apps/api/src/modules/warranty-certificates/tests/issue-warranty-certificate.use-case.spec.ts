import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import {
  warranty_certificate_email_status,
  warranty_certificate_status,
} from '@prisma/client';

describe('IssueWarrantyCertificateUseCase', () => {
  it('generates a certificate without queueing email when no recipient email exists', async () => {
    const warranty = {
      end_date: new Date('2029-07-24T00:00:00.000Z'),
      id: 'warranty-id',
      product: {
        display_name: null,
        template: {
          name: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
        },
        ownerships: [
          {
            customer: {
              email: null,
              full_name: 'Thanh',
              phone: '0344247918',
            },
          },
        ],
        serial_number: 'SN-001',
      },
      start_date: new Date('2026-07-24T00:00:00.000Z'),
      duration_months: 36,
      warranty_code: 'WM-2026-ABC123',
    };
    const request = {
      customer_email: null,
      customer_name: 'Thanh',
      customer_phone: '0344247918',
      dealer: null,
      full_address: 'Hà Nội',
      installed_at: new Date('2026-07-24T00:00:00.000Z'),
      metadata: {},
      vehicle_model: 'Toyota Camry',
      vehicle_plate: '30A-12345',
      warranty_duration_months: 36,
    };
    const prismaService = {
      warranty: {
        findUnique: jest.fn().mockResolvedValue(warranty),
      },
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
      },
      warrantyCertificate: {
        create: jest.fn().mockResolvedValue({
          id: 'certificate-id',
          recipient_email: null,
        }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const uploadAssetService = {
      upload: jest.fn().mockResolvedValue({
        path: 'private/2026/07/warranty-certificates/cert.pdf',
      }),
    };
    const certificateEmailQueueService = {
      queueEmail: jest.fn(),
    };
    const pdfService = {
      createPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-')),
    };
    const useCase = new IssueWarrantyCertificateUseCase(
      prismaService as never,
      uploadAssetService as never,
      certificateEmailQueueService as never,
      pdfService,
    );

    const result = await useCase.execute({
      requestId: 'request-id',
      warrantyId: 'warranty-id',
    });

    expect(certificateEmailQueueService.queueEmail).not.toHaveBeenCalled();
    expect(prismaService.warrantyCertificate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email_status: warranty_certificate_email_status.PENDING,
          recipient_email: null,
          status: warranty_certificate_status.GENERATED,
          warranty: { connect: { id: 'warranty-id' } },
        }),
      }),
    );
    expect(result).toEqual({
      id: 'certificate-id',
      recipient_email: null,
    });
  });

  it('deletes the uploaded PDF when the certificate record cannot be created', async () => {
    const warranty = {
      end_date: new Date('2029-07-24T00:00:00.000Z'),
      id: 'warranty-id',
      product: {
        display_name: null,
        template: { name: 'Lexzenz Film' },
        ownerships: [],
        serial_number: 'SN-001',
      },
      start_date: new Date('2026-07-24T00:00:00.000Z'),
      duration_months: 36,
      warranty_code: 'WM-2026-ABC123',
    };
    const prismaService = {
      warranty: {
        findUnique: jest.fn().mockResolvedValue(warranty),
      },
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warrantyCertificate: {
        create: jest.fn().mockRejectedValue(new Error('Database unavailable')),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const uploadedPath =
      'private/2026/07/warranty-certificates/certificate.pdf';
    const uploadAssetService = {
      delete: jest.fn().mockResolvedValue(undefined),
      upload: jest.fn().mockResolvedValue({ path: uploadedPath }),
    };
    const useCase = new IssueWarrantyCertificateUseCase(
      prismaService as never,
      uploadAssetService as never,
      { queueEmail: jest.fn() } as never,
      {
        createPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-')),
      },
    );

    await expect(useCase.execute({ warrantyId: warranty.id })).rejects.toThrow(
      'Database unavailable',
    );
    expect(uploadAssetService.delete).toHaveBeenCalledWith(uploadedPath);
  });

  it('records a failed certificate without reverting the activated warranty', async () => {
    const warranty = buildWarranty();
    const prismaService = {
      warranty: { findUnique: jest.fn().mockResolvedValue(warranty) },
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warrantyCertificate: {
        create: jest.fn().mockResolvedValue({
          id: 'failed-certificate-id',
          status: warranty_certificate_status.FAILED,
        }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const useCase = new IssueWarrantyCertificateUseCase(
      prismaService as never,
      { upload: jest.fn() } as never,
      { queueEmail: jest.fn() } as never,
      {
        createPdfBuffer: jest
          .fn()
          .mockRejectedValue(new Error('PDF generation failed')),
      },
    );

    await expect(
      useCase.execute({ queueEmail: false, warrantyId: warranty.id }),
    ).rejects.toThrow('PDF generation failed');
    expect(prismaService.warrantyCertificate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        last_error: 'PDF generation failed',
        status: warranty_certificate_status.FAILED,
        warranty: { connect: { id: warranty.id } },
      }),
    });
  });

  it('retries and replaces a previously failed certificate', async () => {
    const warranty = buildWarranty();
    const failedCertificate = {
      certificate_number: 'CERT-FAILED-001',
      id: 'failed-certificate-id',
      status: warranty_certificate_status.FAILED,
    };
    const prismaService = {
      warranty: { findUnique: jest.fn().mockResolvedValue(warranty) },
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warrantyCertificate: {
        findFirst: jest.fn().mockResolvedValue(failedCertificate),
        update: jest.fn().mockResolvedValue({
          ...failedCertificate,
          status: warranty_certificate_status.GENERATED,
          storage_key: 'private/retried.pdf',
        }),
      },
    };
    const useCase = new IssueWarrantyCertificateUseCase(
      prismaService as never,
      {
        upload: jest.fn().mockResolvedValue({ path: 'private/retried.pdf' }),
      } as never,
      { queueEmail: jest.fn() } as never,
      { createPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-')) },
    );

    await expect(
      useCase.execute({ queueEmail: false, warrantyId: warranty.id }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: warranty_certificate_status.GENERATED,
      }),
    );
    expect(prismaService.warrantyCertificate.update).toHaveBeenCalledWith({
      where: { id: failedCertificate.id },
      data: expect.objectContaining({
        last_error: null,
        status: warranty_certificate_status.GENERATED,
        storage_key: 'private/retried.pdf',
      }),
    });
  });
});

function buildWarranty() {
  return {
    duration_months: 36,
    end_date: new Date('2029-07-24T00:00:00.000Z'),
    id: 'warranty-id',
    product: {
      display_name: null,
      ownerships: [],
      serial_number: 'SN-001',
      template: { name: 'Lexzenz Film' },
    },
    start_date: new Date('2026-07-24T00:00:00.000Z'),
    warranty_code: 'WM-2026-ABC123',
  };
}
