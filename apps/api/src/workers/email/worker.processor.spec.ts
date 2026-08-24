import { EmailProcessor } from '@/workers/email/worker.processor';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { warranty_certificate_email_status } from '@prisma/client';

describe('EmailProcessor', () => {
  it('marks a product certificate as sent', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const prismaService = {
      warrantyCertificate: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const processor = new EmailProcessor(
      emailService as never,
      new WarrantyCertificatesRepository(prismaService as never),
      new WarrantyActivationRequestCertificatesRepository(
        prismaService as never,
      ),
    );
    const job = {
      data: {
        context: {},
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyCertificateId: 'certificate-1',
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await processor.process(job as never);

    expect(prismaService.warrantyCertificate.update).toHaveBeenCalledWith({
      where: { id: 'certificate-1' },
      data: expect.objectContaining({
        email_status: warranty_certificate_email_status.SENT,
        last_error: null,
      }),
    });
  });

  it('marks a request-owned certificate as sent', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const prismaService = {
      warrantyActivationRequestCertificate: {
        update: jest.fn().mockResolvedValue({}),
      },
      warrantyCertificate: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const processor = new EmailProcessor(
      emailService as never,
      new WarrantyCertificatesRepository(prismaService as never),
      new WarrantyActivationRequestCertificatesRepository(
        prismaService as never,
      ),
    );
    const job = {
      data: {
        context: {},
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyActivationRequestCertificateId: 'request-certificate-1',
      },
      id: 'request-certificate-job',
      updateProgress: jest.fn(),
    };

    await processor.process(job as never);

    expect(
      prismaService.warrantyActivationRequestCertificate.update,
    ).toHaveBeenCalledWith({
      where: { id: 'request-certificate-1' },
      data: expect.objectContaining({
        email_status: warranty_certificate_email_status.SENT,
        last_error: null,
      }),
    });
    expect(prismaService.warrantyCertificate.update).not.toHaveBeenCalled();
  });
});
