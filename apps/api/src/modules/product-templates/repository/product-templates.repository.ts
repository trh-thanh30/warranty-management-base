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

  findBySku(sku: string) {
    return this.prismaService.productTemplate.findUnique({
      where: { sku },
      include: productTemplateInclude,
    });
  }

  findBySlug(slug: string) {
    return this.prismaService.productTemplate.findUnique({
      where: { slug },
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

  list(filters: ListProductTemplatesDto) {
    const search = filters.search?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
    const isPublished =
      filters.isPublished === undefined
        ? undefined
        : filters.isPublished === 'true';
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.ProductTemplateWhereInput = {
      is_active: isActive,
      is_published: isPublished,
      OR: search
        ? [
            { sku: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            {
              category_ref: {
                is: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
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
