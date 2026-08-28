import { NotFoundError } from '@/common/response';
import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { Readable } from 'node:stream';

describe('DownloadWarrantyActivationRequestCertificateUseCase', () => {
  it('returns the aggregate request-owned certificate PDF stream', async () => {
    const stream = Readable.from(['pdf']);
    const getCertificateFileUseCase = {
      execute: jest.fn().mockResolvedValue({
        certificateNumber: 'CERT-2026-ABC123',
        storageKey: 'private/request-certificate.pdf',
      }),
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(stream),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      getCertificateFileUseCase as never,
      uploadAssetService as never,
    );

    await expect(useCase.execute('request-id')).resolves.toEqual({
      filename: 'CERT-2026-ABC123.pdf',
      stream,
    });
    expect(getCertificateFileUseCase.execute).toHaveBeenCalledWith(
      'request-id',
    );
    expect(uploadAssetService.getStream).toHaveBeenCalledWith(
      'private/request-certificate.pdf',
    );
  });

  it('does not fall back when the request has no aggregate certificate', async () => {
    const getCertificateFileUseCase = {
      execute: jest.fn().mockResolvedValue(null),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      getCertificateFileUseCase as never,
      { getStream: jest.fn() } as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
