import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { warranty_certificate_email_status } from '@prisma/client';

describe('Warranty certificate email status persistence', () => {
  it('does not move an already sent certificate back to queued', async () => {
    const prismaService = {
      warrantyCertificate: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const repository = new WarrantyCertificatesRepository(
      prismaService as never,
    );
    const emailedAt = new Date('2026-08-25T10:00:00.000Z');

    await repository.markEmailQueued(['certificate-1'], emailedAt);

    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['certificate-1'] },
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: {
        email_status: warranty_certificate_email_status.QUEUED,
        emailed_at: emailedAt,
        last_error: null,
      },
    });
  });

  it('does not overwrite a terminal email result when queueing fails', async () => {
    const prismaService = {
      warrantyCertificate: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const repository = new WarrantyCertificatesRepository(
      prismaService as never,
    );

    await repository.markEmailQueueFailed(
      ['certificate-1'],
      'Queue unavailable',
    );

    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['certificate-1'] },
        email_status: {
          notIn: [
            warranty_certificate_email_status.FAILED,
            warranty_certificate_email_status.SENT,
          ],
        },
      },
      data: {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: 'Queue unavailable',
      },
    });
  });

  it('does not rewrite certificates that are already sent', async () => {
    const prismaService = {
      warrantyCertificate: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const repository = new WarrantyCertificatesRepository(
      prismaService as never,
    );
    const emailedAt = new Date('2026-08-25T10:00:00.000Z');

    await repository.markEmailSent(['certificate-1'], emailedAt);

    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['certificate-1'] },
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: {
        email_status: warranty_certificate_email_status.SENT,
        emailed_at: emailedAt,
        last_error: null,
      },
    });
  });

  it('does not downgrade sent or repeatedly failed certificates', async () => {
    const prismaService = {
      warrantyCertificate: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const repository = new WarrantyCertificatesRepository(
      prismaService as never,
    );

    await repository.markEmailFailed(['certificate-1'], 'SMTP unavailable');

    expect(prismaService.warrantyCertificate.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['certificate-1'] },
        email_status: {
          notIn: [
            warranty_certificate_email_status.FAILED,
            warranty_certificate_email_status.SENT,
          ],
        },
      },
      data: {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: 'SMTP unavailable',
      },
    });
  });
});
