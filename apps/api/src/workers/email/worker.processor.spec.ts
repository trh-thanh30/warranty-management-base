import { EmailProcessor } from '@/workers/email/worker.processor';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { warranty_certificate_email_status } from '@prisma/client';

describe('EmailProcessor', () => {
  it('marks every certificate in an aggregate email as sent', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const prismaService = {
      warrantyCertificate: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const processor = new EmailProcessor(
      emailService as never,
      new WarrantyCertificatesRepository(prismaService as never),
    );
    const job = {
      data: {
        context: {},
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyCertificateIds: ['certificate-1', 'certificate-2'],
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await processor.process(job as never);

    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['certificate-1', 'certificate-2'] } },
      data: expect.objectContaining({
        email_status: warranty_certificate_email_status.SENT,
        last_error: null,
      }),
    });
  });
});
