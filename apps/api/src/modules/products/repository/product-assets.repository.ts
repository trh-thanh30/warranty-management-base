import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, product_asset_role } from '@prisma/client';

@Injectable()
export class ProductAssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProduct(productId: string) {
    return this.prisma.product.findUnique({ where: { id: productId } });
  }

  findAsset(assetId: string) {
    return this.prisma.asset.findUnique({ where: { id: assetId } });
  }

  findById(id: string) {
    return this.prisma.productAsset.findUnique({ where: { id } });
  }

  async attach(
    productId: string,
    data: {
      assetId: string;
      role: product_asset_role;
      sortOrder: number;
      altText?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const replacedCoverAssetIds =
        data.role === product_asset_role.COVER
          ? (
              await tx.productAsset.findMany({
                where: {
                  product_id: productId,
                  role: product_asset_role.COVER,
                  asset_id: { not: data.assetId },
                },
                select: { asset_id: true },
              })
            ).map(({ asset_id }) => asset_id)
          : [];

      if (replacedCoverAssetIds.length) {
        await tx.productAsset.deleteMany({
          where: {
            product_id: productId,
            role: product_asset_role.COVER,
            asset_id: { not: data.assetId },
          },
        });
      }

      const productAsset = await tx.productAsset.upsert({
        where: {
          product_id_asset_id: {
            product_id: productId,
            asset_id: data.assetId,
          },
        },
        create: {
          product_id: productId,
          asset_id: data.assetId,
          role: data.role,
          sort_order: data.sortOrder,
          alt_text: data.altText,
        },
        update: {
          role: data.role,
          sort_order: data.sortOrder,
          alt_text: data.altText,
        },
      });

      return { productAsset, replacedCoverAssetIds };
    });
  }

  async update(
    id: string,
    productId: string,
    data: Prisma.ProductAssetUpdateInput,
    nextRole?: product_asset_role,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const replacedCoverAssetIds =
        nextRole === product_asset_role.COVER
          ? (
              await tx.productAsset.findMany({
                where: {
                  id: { not: id },
                  product_id: productId,
                  role: product_asset_role.COVER,
                },
                select: { asset_id: true },
              })
            ).map(({ asset_id }) => asset_id)
          : [];

      if (replacedCoverAssetIds.length) {
        await tx.productAsset.deleteMany({
          where: {
            id: { not: id },
            product_id: productId,
            role: product_asset_role.COVER,
          },
        });
      }

      const productAsset = await tx.productAsset.update({
        where: { id },
        data,
      });

      return { productAsset, replacedCoverAssetIds };
    });
  }

  delete(id: string) {
    return this.prisma.productAsset.delete({ where: { id } });
  }
}
