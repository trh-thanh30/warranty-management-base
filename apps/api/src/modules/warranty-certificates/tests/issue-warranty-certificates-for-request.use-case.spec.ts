import { IssueWarrantyCertificatesForRequestUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificates-for-request.use-case';

describe('IssueWarrantyCertificatesForRequestUseCase', () => {
  const issueWarrantyCertificateUseCase = { execute: jest.fn() };
  const batchEmailService = { queueEmail: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('issues one certificate per warranty and queues one aggregate email', async () => {
    issueWarrantyCertificateUseCase.execute
      .mockResolvedValueOnce({ id: 'certificate-1' })
      .mockResolvedValueOnce({ id: 'certificate-2' });
    batchEmailService.queueEmail.mockResolvedValue(undefined);
    const useCase = new IssueWarrantyCertificatesForRequestUseCase(
      issueWarrantyCertificateUseCase as never,
      batchEmailService as never,
    );

    const result = await useCase.execute({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
      warrantyIds: ['warranty-1', 'warranty-2'],
    });

    expect(issueWarrantyCertificateUseCase.execute).toHaveBeenNthCalledWith(1, {
      queueEmail: false,
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
      warrantyId: 'warranty-1',
    });
    expect(issueWarrantyCertificateUseCase.execute).toHaveBeenNthCalledWith(2, {
      queueEmail: false,
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
      warrantyId: 'warranty-2',
    });
    expect(batchEmailService.queueEmail).toHaveBeenCalledTimes(1);
    expect(batchEmailService.queueEmail).toHaveBeenCalledWith({
      certificateIds: ['certificate-1', 'certificate-2'],
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });
    expect(result).toEqual({
      certificateIds: ['certificate-1', 'certificate-2'],
      failures: [],
    });
  });

  it('does not roll back issued warranties when one certificate fails', async () => {
    issueWarrantyCertificateUseCase.execute
      .mockResolvedValueOnce({ id: 'certificate-1' })
      .mockRejectedValueOnce(new Error('PDF generation failed'));
    const useCase = new IssueWarrantyCertificatesForRequestUseCase(
      issueWarrantyCertificateUseCase as never,
      batchEmailService as never,
    );

    await expect(
      useCase.execute({
        recipientEmail: 'customer@example.com',
        requestId: 'request-id',
        warrantyIds: ['warranty-1', 'warranty-2'],
      }),
    ).resolves.toEqual({
      certificateIds: ['certificate-1'],
      failures: [
        { message: 'PDF generation failed', warrantyId: 'warranty-2' },
      ],
    });
    expect(batchEmailService.queueEmail).toHaveBeenCalledWith({
      certificateIds: ['certificate-1'],
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });
  });

  it('does not fail the approved request when aggregate email queueing fails', async () => {
    issueWarrantyCertificateUseCase.execute.mockResolvedValue({
      id: 'certificate-1',
    });
    batchEmailService.queueEmail.mockRejectedValue(
      new Error('Email queue unavailable'),
    );
    const useCase = new IssueWarrantyCertificatesForRequestUseCase(
      issueWarrantyCertificateUseCase as never,
      batchEmailService as never,
    );

    await expect(
      useCase.execute({
        recipientEmail: 'customer@example.com',
        requestId: 'request-id',
        warrantyIds: ['warranty-1'],
      }),
    ).resolves.toEqual({
      certificateIds: ['certificate-1'],
      emailFailure: 'Email queue unavailable',
      failures: [],
    });
  });
});
