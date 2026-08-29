import { Prisma, product_asset_role } from '@prisma/client';

export function buildProductAssets(
  coverAssetId?: string,
  galleryAssetIds: string[] = [],
): Prisma.ProductAssetCreateNestedManyWithoutProductInput | undefined {
  const uniqueGalleryIds = [...new Set(galleryAssetIds)].filter(
    (assetId) => assetId !== coverAssetId,
  );
  const assets = [
    ...(coverAssetId
      ? [
          {
            asset: { connect: { id: coverAssetId } },
            role: product_asset_role.COVER,
            sort_order: 0,
          },
        ]
      : []),
    ...uniqueGalleryIds.map((assetId, index) => ({
      asset: { connect: { id: assetId } },
      role: product_asset_role.GALLERY,
      sort_order: index,
    })),
  ];

  return assets.length ? { create: assets } : undefined;
}
