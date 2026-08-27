import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { NotFoundError } from '@/common/response';
import { Readable } from 'stream';

describe('DownloadWarrantyActivationRequestCertificateUseCase', () => {
  it('returns the latest certificate PDF stream for an activation request', async () => {
    const stream = Readable.from(['pdf']);
    const getCertificateFileUseCase = {
      execute: jest.fn().mockResolvedValue({
        certificateNumber: 'CERT-2026-ABC123',
        storageKey: 'private/2026/07/warranty-certificates/file.pdf',
      }),
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(stream),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      getCertificateFileUseCase as never,
      uploadAssetService as never,
    );

    const result = await useCase.execute('request-id');

    expect(getCertificateFileUseCase.execute).toHaveBeenCalledWith(
      'request-id',
      undefined,
    );
    expect(uploadAssetService.getStream).toHaveBeenCalledWith(
      'private/2026/07/warranty-certificates/file.pdf',
    );
    expect(result).toEqual({
      filename: 'CERT-2026-ABC123.pdf',
      stream,
    });
  });

  it('rejects when the request has no generated certificate file', async () => {
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

  it('returns the certificate belonging to the requested item', async () => {
    const stream = Readable.from(['item-pdf']);
    const getCertificateFileUseCase = {
      execute: jest.fn().mockResolvedValue({
        certificateNumber: 'CERT-ITEM-002',
        storageKey: 'private/item-2.pdf',
      }),
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(stream),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      getCertificateFileUseCase as never,
      uploadAssetService as never,
    );

    await expect(useCase.execute('request-id', 'item-2')).resolves.toEqual({
      filename: 'CERT-ITEM-002.pdf',
      stream,
    });
    expect(getCertificateFileUseCase.execute).toHaveBeenCalledWith(
      'request-id',
      'item-2',
    );
  });
});
