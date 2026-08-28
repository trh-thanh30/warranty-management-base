import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-activation-request-certificate-email.use-case';

describe('ResendWarrantyActivationRequestCertificateEmailUseCase', () => {
  const repository = { findByRequestId: jest.fn() };
  const emailService = { queueEmail: jest.fn() };
  const issueCertificateUseCase = { execute: jest.fn() };

  beforeEach(() => jest.resetAllMocks());

  it('queues an existing generated certificate by its application id', async () => {
    repository.findByRequestId.mockResolvedValue({
      id: 'certificate-1',
      status: 'GENERATED',
    });
    emailService.queueEmail.mockResolvedValue({ id: 'certificate-1' });
    const useCase = createUseCase();

    await useCase.execute('request-1');

    expect(emailService.queueEmail).toHaveBeenCalledWith('certificate-1');
    expect(issueCertificateUseCase.execute).not.toHaveBeenCalled();
  });

  it('regenerates a failed certificate before sending it again', async () => {
    repository.findByRequestId.mockResolvedValue({
      id: 'certificate-1',
      recipientEmail: 'customer@example.com',
      status: 'FAILED',
    });
    issueCertificateUseCase.execute.mockResolvedValue({ id: 'certificate-1' });
    const useCase = createUseCase();

    await useCase.execute('request-1');

    expect(issueCertificateUseCase.execute).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-1',
    });
    expect(emailService.queueEmail).not.toHaveBeenCalled();
  });

  it('returns a structured error when the request certificate is absent', async () => {
    repository.findByRequestId.mockResolvedValue(null);
    const useCase = createUseCase();

    await expect(useCase.execute('request-1')).rejects.toMatchObject({
      code: 'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
      details: { requestId: 'request-1' },
      statusCode: 404,
    });
    expect(emailService.queueEmail).not.toHaveBeenCalled();
    expect(issueCertificateUseCase.execute).not.toHaveBeenCalled();
  });

  function createUseCase() {
    return new ResendWarrantyActivationRequestCertificateEmailUseCase(
      repository as never,
      emailService as never,
      issueCertificateUseCase as never,
    );
  }
});
