import { GetStorageUsageUseCase } from '@/modules/assets/use-cases/get-storage-usage.use-case';

describe('GetStorageUsageUseCase', () => {
  it('aggregates bucket and warranty certificate usage', async () => {
    const uploadAssetService = {
      list: jest.fn().mockImplementation((prefix: string) => {
        if (prefix === 'public') {
          return [{ path: 'public/image.jpg', size: 100 }];
        }
        if (prefix === 'private') {
          return [
            {
              path: 'private/2026/07/warranty-certificates/a.pdf',
              size: 500,
            },
            {
              path: 'private/2026/07/warranty-certificates/b.pdf',
              size: 700,
            },
            { path: 'private/document.pdf', size: 300 },
          ];
        }
        return [{ path: 'temp/upload.tmp', size: 400 }];
      }),
    };
    const useCase = new GetStorageUsageUseCase(
      uploadAssetService as never,
      {
        warrantyCertificate: {
          findMany: jest.fn().mockResolvedValue([
            {
              storage_key: 'private/2026/07/warranty-certificates/a.pdf',
            },
          ]),
        },
      } as never,
      { capacityBytes: 2_000 } as never,
    );

    await expect(useCase.execute()).resolves.toEqual({
      alertLevel: 'EMERGENCY',
      buckets: {
        private: { bytes: 1_500, objects: 3 },
        public: { bytes: 100, objects: 1 },
        temp: { bytes: 400, objects: 1 },
      },
      capacityBytes: 2_000,
      certificates: {
        averageBytes: 600,
        bytes: 1_200,
        objects: 2,
        orphanedBytes: 700,
        orphanedObjects: 1,
      },
      totalBytes: 2_000,
      totalObjects: 5,
      usagePercent: 100,
    });
  });

  it('returns no alert percentage when no capacity budget is configured', async () => {
    const uploadAssetService = {
      list: jest.fn().mockResolvedValue([]),
    };
    const useCase = new GetStorageUsageUseCase(
      uploadAssetService as never,
      {
        warrantyCertificate: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as never,
      { capacityBytes: null } as never,
    );

    const result = await useCase.execute();

    expect(result.alertLevel).toBe('UNCONFIGURED');
    expect(result.capacityBytes).toBeNull();
    expect(result.usagePercent).toBeNull();
  });

  it.each([
    [69, 'NORMAL'],
    [70, 'WARNING'],
    [85, 'CRITICAL'],
    [95, 'EMERGENCY'],
  ] as const)(
    'returns the expected alert at %s percent usage',
    async (usagePercent, expectedLevel) => {
      const uploadAssetService = {
        list: jest
          .fn()
          .mockResolvedValueOnce([{ path: 'public/file', size: usagePercent }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };
      const useCase = new GetStorageUsageUseCase(
        uploadAssetService as never,
        {
          warrantyCertificate: {
            findMany: jest.fn().mockResolvedValue([]),
          },
        } as never,
        { capacityBytes: 100 } as never,
      );

      const result = await useCase.execute();

      expect(result.alertLevel).toBe(expectedLevel);
    },
  );
});
