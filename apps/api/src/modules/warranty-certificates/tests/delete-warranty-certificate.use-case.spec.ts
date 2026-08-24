import { DeleteWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/delete-warranty-certificate.use-case';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeleteWarrantyCertificateUseCase', () => {
  const certificate = {
    id: 'certificate-id',
    storage_key: 'private/2026/07/warranty-certificates/certificate.pdf',
  };

  function createDependencies() {
    return {
      prismaService: {
        warrantyCertificate: {
          delete: jest.fn().mockResolvedValue(certificate),
          findUnique: jest.fn().mockResolvedValue(certificate),
        },
      },
      uploadAssetService: {
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
  }

  it('deletes the storage object before deleting the certificate record', async () => {
    const { prismaService, uploadAssetService } = createDependencies();
    const useCase = new DeleteWarrantyCertificateUseCase(
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
    );

    await useCase.execute(certificate.id);

    expect(uploadAssetService.delete).toHaveBeenCalledWith(
      certificate.storage_key,
    );
    expect(prismaService.warrantyCertificate.delete).toHaveBeenCalledWith({
      where: { id: certificate.id },
    });
    expect(uploadAssetService.delete.mock.invocationCallOrder[0]).toBeLessThan(
      prismaService.warrantyCertificate.delete.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('keeps the database record when storage deletion fails', async () => {
    const { prismaService, uploadAssetService } = createDependencies();
    uploadAssetService.delete.mockRejectedValue(new Error('MinIO unavailable'));
    const useCase = new DeleteWarrantyCertificateUseCase(
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
    );

    await expect(useCase.execute(certificate.id)).rejects.toThrow(
      'MinIO unavailable',
    );
    expect(prismaService.warrantyCertificate.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion when the certificate does not exist', async () => {
    const { prismaService, uploadAssetService } = createDependencies();
    prismaService.warrantyCertificate.findUnique.mockResolvedValue(null);
    const useCase = new DeleteWarrantyCertificateUseCase(
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
    );

    await expect(useCase.execute(certificate.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(uploadAssetService.delete).not.toHaveBeenCalled();
  });
});
