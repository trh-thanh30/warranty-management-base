import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';

describe('GetWarrantyCertificateFileForActivationRequestUseCase', () => {
  it('delegates file lookup through the certificate repository contract', async () => {
    const file = {
      certificateNumber: 'CERT-001',
      storageKey: 'private/certificate.pdf',
    };
    const repository = {
      findFileByRequestId: jest.fn().mockResolvedValue(file),
    };
    const useCase = new GetWarrantyCertificateFileForActivationRequestUseCase(
      repository as never,
    );

    await expect(useCase.execute('request-1')).resolves.toBe(file);
    expect(repository.findFileByRequestId).toHaveBeenCalledWith('request-1');
  });
});
