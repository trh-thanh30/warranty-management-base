import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
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
      new WarrantyCertificatesRepository(prismaService as never),
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
      new WarrantyCertificatesRepository(prismaService as never),
      { getStream: jest.fn() } as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns the certificate belonging to the requested item', async () => {
    const stream = Readable.from(['item-pdf']);
    const prismaService = {
      warrantyActivationRequestItem: {
        findFirst: jest.fn().mockResolvedValue({
          warranty: {
            certificates: [
              {
                certificate_number: 'CERT-ITEM-002',
                storage_key: 'private/item-2.pdf',
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
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
    );

    await expect(useCase.execute('request-id', 'item-2')).resolves.toEqual({
      filename: 'CERT-ITEM-002.pdf',
      stream,
    });
    expect(
      prismaService.warrantyActivationRequestItem.findFirst,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-2', request_id: 'request-id' },
      }),
    );
  });
});
