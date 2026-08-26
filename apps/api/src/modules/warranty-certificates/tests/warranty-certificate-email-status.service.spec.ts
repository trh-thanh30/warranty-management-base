import { WarrantyCertificateEmailStatusService } from '@/modules/warranty-certificates/services/warranty-certificate-email-status.service';

describe('WarrantyCertificateEmailStatusService', () => {
  it('does not issue a persistence update when no certificate is present', async () => {
    const repository = {
      markEmailFailed: jest.fn(),
      markEmailSent: jest.fn(),
    };
    const service = new WarrantyCertificateEmailStatusService(
      repository as never,
    );

    await service.markSent([]);
    await service.markFailed([], 'SMTP unavailable');

    expect(repository.markEmailSent).not.toHaveBeenCalled();
    expect(repository.markEmailFailed).not.toHaveBeenCalled();
  });

  it('normalizes duplicate certificate ids before applying a transition', async () => {
    const repository = {
      markEmailFailed: jest.fn().mockResolvedValue({ count: 2 }),
      markEmailSent: jest.fn().mockResolvedValue({ count: 2 }),
    };
    const service = new WarrantyCertificateEmailStatusService(
      repository as never,
    );

    await service.markSent(['certificate-1', 'certificate-1', 'certificate-2']);
    await service.markFailed(
      ['certificate-1', 'certificate-1', 'certificate-2'],
      'SMTP unavailable',
    );

    expect(repository.markEmailSent).toHaveBeenCalledWith(
      ['certificate-1', 'certificate-2'],
      expect.any(Date),
    );
    expect(repository.markEmailFailed).toHaveBeenCalledWith(
      ['certificate-1', 'certificate-2'],
      'SMTP unavailable',
    );
  });
});
