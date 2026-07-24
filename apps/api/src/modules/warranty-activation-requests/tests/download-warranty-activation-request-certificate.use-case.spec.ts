import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { NotFoundError } from '@/common/response';
import { Readable } from 'stream';

describe('DownloadWarrantyActivationRequestCertificateUseCase', () => {
  it('returns the latest certificate PDF stream for an activation request', async () => {
    const stream = Readable.from(['pdf']);
    const prismaService = {
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue({
          activated_warranty: {
            certificates: [
              {
                certificate_number: 'CERT-2026-ABC123',
                storage_key: 'private/2026/07/warranty-certificates/file.pdf',
              },
            ],
          },
        }),
      },
    };
    const uploadAssetService = {
      getStream: jest.fn().mockResolvedValue(stream),
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      prismaService as never,
      uploadAssetService as never,
    );

    const result = await useCase.execute('request-id');

    expect(
      prismaService.warrantyActivationRequest.findUnique,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'request-id' },
      }),
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
    const prismaService = {
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue({
          activated_warranty: { certificates: [] },
        }),
      },
    };
    const useCase = new DownloadWarrantyActivationRequestCertificateUseCase(
      prismaService as never,
      { getStream: jest.fn() } as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
