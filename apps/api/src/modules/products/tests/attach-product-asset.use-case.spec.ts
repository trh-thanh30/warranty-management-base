import { AttachProductAssetUseCase } from '@/modules/products/use-cases/attach-product-asset.use-case';
import { asset_type, product_asset_role } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('AttachProductAssetUseCase', () => {
  it('replaces the cover and cleans the previous asset when unreferenced', async () => {
    const repository = {
      findProduct: jest.fn().mockResolvedValue({
        id: 'product-id',
        deleted_at: null,
      }),
      findAsset: jest.fn().mockResolvedValue({
        id: 'new-asset-id',
        type: asset_type.IMAGE,
        is_deleted: false,
        mime_type: 'image/jpeg',
        original_name: 'cover.jpg',
      }),
      attach: jest.fn().mockResolvedValue({
        productAsset: {
          id: 'product-asset-id',
          asset_id: 'new-asset-id',
          role: product_asset_role.COVER,
          sort_order: 0,
          alt_text: 'Product',
        },
        replacedCoverAssetIds: ['old-asset-id'],
      }),
    };
    const assetsService = {
      deleteAssetIfUnreferenced: jest.fn().mockResolvedValue(true),
      enrichAssetUrl: jest.fn().mockReturnValue({
        url: 'https://cdn.example.com/products/cover.jpg',
      }),
    };
    const useCase = new AttachProductAssetUseCase(
      repository as never,
      assetsService as never,
    );

    const result = await useCase.execute('product-id', {
      assetId: 'new-asset-id',
      role: product_asset_role.COVER,
      altText: 'Product',
    });

    expect(assetsService.deleteAssetIfUnreferenced).toHaveBeenCalledWith(
      'old-asset-id',
    );
    expect(result).toEqual(
      expect.objectContaining({
        role: product_asset_role.COVER,
        url: 'https://cdn.example.com/products/cover.jpg',
      }),
    );
  });

  it('attaches product-owned media during the template transition', async () => {
    const repository = {
      findProduct: jest.fn().mockResolvedValue({
        id: 'product-id',
        deleted_at: null,
      }),
      findAsset: jest.fn().mockResolvedValue({
        id: 'asset-id',
        type: asset_type.IMAGE,
        is_deleted: false,
        mime_type: 'image/jpeg',
        original_name: 'cover.jpg',
      }),
      attach: jest.fn().mockResolvedValue({
        productAsset: {
          id: 'product-asset-id',
          asset_id: 'asset-id',
          role: product_asset_role.COVER,
          sort_order: 0,
          alt_text: null,
        },
        replacedCoverAssetIds: [],
      }),
    };
    const assetsService = {
      deleteAssetIfUnreferenced: jest.fn(),
      enrichAssetUrl: jest.fn().mockReturnValue({
        url: 'https://cdn.example.com/products/cover.jpg',
      }),
    };
    const useCase = new AttachProductAssetUseCase(
      repository as never,
      assetsService as never,
    );

    const result = await useCase.execute('product-id', {
      assetId: 'asset-id',
      role: product_asset_role.COVER,
    });

    expect(repository.attach).toHaveBeenCalledWith('product-id', {
      assetId: 'asset-id',
      role: product_asset_role.COVER,
      sortOrder: 0,
      altText: undefined,
    });
    expect(result.assetId).toBe('asset-id');
  });
});
