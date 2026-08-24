import { CleanupOrphanedWarrantyCertificatesUseCase } from '@/modules/warranty-certificates/use-cases/cleanup-orphaned-warranty-certificates.use-case';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';

describe('CleanupOrphanedWarrantyCertificatesUseCase', () => {
  const now = new Date('2026-07-24T00:00:00.000Z');
  const referencedPath = 'private/2026/05/warranty-certificates/referenced.pdf';
  const orphanedPath = 'private/2026/05/warranty-certificates/orphaned.pdf';
  const recentOrphanPath =
    'private/2026/07/warranty-certificates/recent-orphan.pdf';
  const unrelatedPath = 'private/2026/05/product-images/image.jpg';

  function createDependencies() {
    return {
      prismaService: {
        warrantyCertificate: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ storage_key: referencedPath }]),
        },
      },
      uploadAssetService: {
        delete: jest.fn().mockResolvedValue(undefined),
        list: jest.fn().mockResolvedValue([
          {
            lastModified: new Date('2026-05-01T00:00:00.000Z'),
            path: referencedPath,
            size: 100,
          },
          {
            lastModified: new Date('2026-05-01T00:00:00.000Z'),
            path: orphanedPath,
            size: 200,
          },
          {
            lastModified: new Date('2026-07-20T00:00:00.000Z'),
            path: recentOrphanPath,
            size: 300,
          },
          {
            lastModified: new Date('2026-05-01T00:00:00.000Z'),
            path: unrelatedPath,
            size: 400,
          },
        ]),
      },
    };
  }

  it('reports old unreferenced certificate PDFs without deleting in dry-run mode', async () => {
    const { prismaService, uploadAssetService } = createDependencies();
    const useCase = new CleanupOrphanedWarrantyCertificatesUseCase(
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
      { millisecondsPerDay: 24 * 60 * 60 * 1000 },
    );

    const result = await useCase.execute({
      dryRun: true,
      now,
      retentionDays: 30,
    });

    expect(uploadAssetService.delete).not.toHaveBeenCalled();
    expect(result).toEqual({
      deleted: 0,
      dryRun: true,
      eligible: 1,
      failed: 0,
      reclaimedBytes: 0,
      scanned: 3,
    });
  });

  it('deletes only old unreferenced certificate PDFs', async () => {
    const { prismaService, uploadAssetService } = createDependencies();
    const useCase = new CleanupOrphanedWarrantyCertificatesUseCase(
      new WarrantyCertificatesRepository(prismaService as never),
      uploadAssetService as never,
      { millisecondsPerDay: 24 * 60 * 60 * 1000 },
    );

    const result = await useCase.execute({
      dryRun: false,
      now,
      retentionDays: 30,
    });

    expect(uploadAssetService.delete).toHaveBeenCalledTimes(1);
    expect(uploadAssetService.delete).toHaveBeenCalledWith(orphanedPath);
    expect(result).toEqual({
      deleted: 1,
      dryRun: false,
      eligible: 1,
      failed: 0,
      reclaimedBytes: 200,
      scanned: 3,
    });
  });
});
