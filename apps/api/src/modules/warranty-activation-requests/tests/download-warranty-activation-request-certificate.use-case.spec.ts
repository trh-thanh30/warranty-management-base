import { NotFoundError } from '@/common/response';
import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { Readable } from 'node:stream';

describe('DownloadWarrantyActivationRequestCertificateUseCase', () => {
  it('returns the request-owned certificate PDF stream', async () => {
    const stream = Readable.from(['pdf']);
    const repository = {
      findByRequestId: jest.fn().mockResolvedValue({
        certificate_number: 'CERT-2026-ABC123',
        storage_key: 'private/request-certificate.pdf',
      }),
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(stream),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      repository as never,
      uploadAssetService as never,
    );

    await expect(useCase.execute('request-id')).resolves.toEqual({
      filename: 'CERT-2026-ABC123.pdf',
      stream,
    });
    expect(repository.findByRequestId).toHaveBeenCalledWith('request-id');
    expect(uploadAssetService.getStream).toHaveBeenCalledWith(
      'private/request-certificate.pdf',
    );
  });

  it('does not fall back when the request has no request-owned certificate', async () => {
    const repository = { findByRequestId: jest.fn().mockResolvedValue(null) };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      repository as never,
      { getStream: jest.fn() } as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
