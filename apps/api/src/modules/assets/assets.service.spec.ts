import { AssetsService } from '@/modules/assets/assets.service';

jest.mock('@/modules/assets/services/upload-asset.service', () => ({
  UploadAssetService: class UploadAssetService {},
}));

describe('AssetsService deletion', () => {
  const asset = {
    id: 'asset-id',
    path: 'public/2026/07/categories/image.jpg',
    uploaded_by_id: 'user-id',
    is_deleted: false,
  };
  const prisma = {
    asset: {
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    assetLink: {
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    productAsset: {
      count: jest.fn(),
    },
    productTemplateAsset: {
      count: jest.fn(),
    },
  };
  const uploadAssetService = {
    delete: jest.fn(),
  };
  const user = {
    id: 'user-id',
    role: 'MODERATOR',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.asset.findUnique.mockResolvedValue(asset);
    uploadAssetService.delete.mockResolvedValue(undefined);
    prisma.asset.delete.mockResolvedValue(asset);
    prisma.assetLink.count.mockResolvedValue(0);
    prisma.productAsset.count.mockResolvedValue(0);
    prisma.productTemplateAsset.count.mockResolvedValue(0);
  });

  it('deletes an entity asset when it has no other references', async () => {
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(
      service.removeEntityAsset(asset.id, {
        id: 'claim-id',
        type: 'warranty_claim',
      }),
    ).resolves.toBe('DELETED');

    expect(uploadAssetService.delete).toHaveBeenCalledWith(asset.path);
    expect(prisma.asset.delete).toHaveBeenCalled();
  });

  it('only unlinks an entity asset when another model still references it', async () => {
    prisma.assetLink.count.mockResolvedValue(1);
    prisma.assetLink.deleteMany.mockResolvedValue({ count: 1 });
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(
      service.removeEntityAsset(asset.id, {
        id: 'claim-id',
        type: 'warranty_claim',
      }),
    ).resolves.toBe('UNLINKED');

    expect(prisma.assetLink.deleteMany).toHaveBeenCalled();
    expect(uploadAssetService.delete).not.toHaveBeenCalled();
  });

  it('hard-deletes the asset only after storage deletion succeeds', async () => {
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await service.deleteAsset(asset.id, user as never);

    expect(uploadAssetService.delete).toHaveBeenCalledWith(asset.path);
    expect(prisma.asset.delete).toHaveBeenCalledWith({
      where: { id: asset.id },
    });
    expect(uploadAssetService.delete.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.asset.delete.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('keeps the database record when storage deletion fails', async () => {
    uploadAssetService.delete.mockRejectedValue(new Error('MinIO unavailable'));
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(service.deleteAsset(asset.id, user as never)).rejects.toThrow(
      'MinIO unavailable',
    );

    expect(prisma.asset.delete).not.toHaveBeenCalled();
  });

  it('refuses direct deletion while an asset is linked to a product', async () => {
    prisma.productAsset.count.mockResolvedValue(1);
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(service.deleteAsset(asset.id, user as never)).rejects.toThrow(
      'Asset is currently in use',
    );

    expect(uploadAssetService.delete).not.toHaveBeenCalled();
  });

  it('refuses deletion while an asset is linked to a product template', async () => {
    prisma.productTemplateAsset.count.mockResolvedValue(1);
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(service.deleteAsset(asset.id, user as never)).rejects.toThrow(
      'Asset is currently in use',
    );

    expect(uploadAssetService.delete).not.toHaveBeenCalled();
  });
});
