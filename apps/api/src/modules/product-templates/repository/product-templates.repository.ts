import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListProductTemplatesDto } from '@/modules/product-templates/dto/list-product-templates.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const productTemplateInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  category_ref: true,
  _count: { select: { products: true } },
};

@Injectable()
export class ProductTemplatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findActiveById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prismaService;

    return client.productTemplate.findFirst({
      where: { id, is_active: true },
      include: productTemplateInclude,
    });
  }

  findById(id: string) {
    return this.prismaService.productTemplate.findUnique({
      where: { id },
      include: productTemplateInclude,
    });
  }

  findImageAssets(ids: string[]) {
    return this.prismaService.asset.findMany({
      where: {
        id: { in: ids },
        is_deleted: false,
        type: 'IMAGE',
      },
    });
  }

  create(
    data: Prisma.ProductTemplateCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prismaService;
    return client.productTemplate.create({
      data,
      include: productTemplateInclude,
    });
  }

  update(
    id: string,
    data: Prisma.ProductTemplateUpdateInput,
    assets?: {
      coverAssetId?: string | null;
      galleryAssetIds?: string[];
    },
  ) {
    return this.prismaService.$transaction(async (tx) => {
      if (assets && 'coverAssetId' in assets) {
        await tx.productTemplateAsset.deleteMany({
          where: { product_template_id: id, role: 'COVER' },
        });
        if (assets.coverAssetId) {
          await tx.productTemplateAsset.create({
            data: {
              product_template_id: id,
              asset_id: assets.coverAssetId,
              role: 'COVER',
            },
          });
        }
      }

      if (assets?.galleryAssetIds) {
        await tx.productTemplateAsset.deleteMany({
          where: { product_template_id: id, role: 'GALLERY' },
        });
        if (assets.galleryAssetIds.length > 0) {
          await tx.productTemplateAsset.createMany({
            data: assets.galleryAssetIds.map((assetId, sortOrder) => ({
              product_template_id: id,
              asset_id: assetId,
              role: 'GALLERY' as const,
              sort_order: sortOrder,
            })),
          });
        }
      }

      return tx.productTemplate.update({
        where: { id },
        data,
        include: productTemplateInclude,
      });
    });
  }

  deactivate(id: string) {
    return this.prismaService.productTemplate.update({
      where: { id },
      data: { is_active: false },
      include: productTemplateInclude,
    });
  }

  findProductTemplateSource(productId: string) {
    return this.prismaService.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        template_id: true,
        deleted_at: true,
      },
    });
  }

  createFromProduct(productId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: {
          assets: true,
          warranty: true,
        },
      });
      const templateMetadata = isJsonRecord(product.metadata)
        ? { ...product.metadata }
        : {};
      delete templateMetadata.installationPosition;
      const reusableAssets = product.assets.filter(
        (asset) => asset.role === 'COVER' || asset.role === 'GALLERY',
      );
      const template = await tx.productTemplate.create({
        data: {
          name: product.name,
          category: product.category,
          category_ref: product.category_id
            ? { connect: { id: product.category_id } }
            : undefined,
          brand: product.brand,
          model: product.model,
          manufacture_year: product.manufacture_year,
          description: product.description,
          default_warranty_duration_months:
            product.warranty?.duration_months ?? 36,
          default_warranty_terms: product.warranty?.terms,
          is_active: Boolean(product.category_id),
          metadata:
            Object.keys(templateMetadata).length > 0
              ? (templateMetadata as Prisma.InputJsonObject)
              : undefined,
          assets:
            reusableAssets.length > 0
              ? {
                  create: reusableAssets.map((asset) => ({
                    asset: { connect: { id: asset.asset_id } },
                    role: asset.role,
                    sort_order: asset.sort_order,
                    alt_text: asset.alt_text,
                  })),
                }
              : undefined,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          template_id: template.id,
          metadata:
            typeof product.metadata === 'object' &&
            product.metadata &&
            !Array.isArray(product.metadata) &&
            typeof product.metadata.installationPosition === 'string'
              ? {
                  installationPosition: product.metadata.installationPosition,
                }
              : Prisma.JsonNull,
        },
      });
      if (reusableAssets.length > 0) {
        await tx.productAsset.deleteMany({
          where: {
            product_id: productId,
            role: { in: ['COVER', 'GALLERY'] },
          },
        });
      }

      return tx.productTemplate.findUniqueOrThrow({
        where: { id: template.id },
        include: productTemplateInclude,
      });
    });
  }

  list(filters: ListProductTemplatesDto) {
    const search = filters.search?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.ProductTemplateWhereInput = {
      is_active: isActive,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.productTemplate.findMany({
          where,
          include: productTemplateInclude,
          orderBy: [{ name: 'asc' }, { created_at: 'desc' }],
          skip,
          take,
        }),
        tx.productTemplate.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }
}

function isJsonRecord(
  value: Prisma.JsonValue | null,
): value is Prisma.JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
