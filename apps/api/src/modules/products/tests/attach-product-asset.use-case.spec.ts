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
        template_id: null,
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

  it('rejects shared media on a product linked to a template', async () => {
    const repository = {
      findProduct: jest.fn().mockResolvedValue({
        id: 'product-id',
        deleted_at: null,
        template_id: 'template-id',
      }),
      findAsset: jest.fn().mockResolvedValue({
        id: 'asset-id',
        type: asset_type.IMAGE,
        is_deleted: false,
      }),
      attach: jest.fn(),
    };
    const useCase = new AttachProductAssetUseCase(
      repository as never,
      {} as never,
    );

    await expect(
      useCase.execute('product-id', {
        assetId: 'asset-id',
        role: product_asset_role.COVER,
      }),
    ).rejects.toThrow(
      'Template-owned product media must be updated on the product template',
    );
    expect(repository.attach).not.toHaveBeenCalled();
  });
});
