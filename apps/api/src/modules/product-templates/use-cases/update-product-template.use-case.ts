import { ConflictError, NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateProductTemplateDto } from '@/modules/product-templates/dto/update-product-template.dto';
import {
  resolveProductTemplateCategory,
  mergeProductTemplateMetadata,
  normalizeSku,
  toTemplateJson,
  validateProductTemplateAssets,
} from '@/modules/product-templates/product-template-input';
import { toProductTemplateResponse } from '@/modules/product-templates/product-templates.types';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductTemplateUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(id: string, dto: UpdateProductTemplateDto) {
    const existing = await this.productTemplatesRepository.findById(id);
    if (!existing) throw new NotFoundError('Product template not found');
    const sku = dto.sku ? normalizeSku(dto.sku) : undefined;
    const slug = dto.slug?.trim() || undefined;
    if (sku && sku !== existing.sku) {
      const conflict = await this.productTemplatesRepository.findBySku(sku);
      if (conflict)
        throw new ConflictError('Product template SKU already exists');
    }
    if (slug && slug !== existing.slug) {
      const conflict = await this.productTemplatesRepository.findBySlug(slug);
      if (conflict) {
        throw new ConflictError('Product template slug already exists');
      }
    }

    const category = dto.categoryId
      ? await resolveProductTemplateCategory(this.prismaService, dto.categoryId)
      : null;
    await validateProductTemplateAssets(
      this.productTemplatesRepository,
      dto.coverAssetId,
      dto.galleryAssetIds,
    );
    const removedAssetIds = getRemovedTemplateAssetIds(existing.assets ?? [], {
      coverAssetId: dto.coverAssetId,
      galleryAssetIds: dto.galleryAssetIds,
    });
    const template = await this.productTemplatesRepository.update(
      id,
      {
        sku,
        slug,
        name: dto.name,
        category_ref: category ? { connect: { id: category.id } } : undefined,
        brand: dto.brand,
        model: dto.model,
        model_year: dto.modelYear,
        description: dto.description,
        default_warranty_duration_months: dto.defaultWarrantyDurationMonths,
        default_warranty_terms: dto.defaultWarrantyTerms,
        metadata: toTemplateJson(
          mergeProductTemplateMetadata(existing.metadata, dto.metadata),
        ),
        is_active: dto.isActive,
        is_published: dto.isPublished,
        published_at:
          dto.isPublished === undefined
            ? undefined
            : dto.isPublished
              ? (existing.published_at ?? new Date())
              : null,
      },
      {
        ...(dto.coverAssetId !== undefined
          ? { coverAssetId: dto.coverAssetId }
          : {}),
        ...(dto.galleryAssetIds !== undefined
          ? {
              galleryAssetIds: dto.galleryAssetIds.filter(
                (assetId) => assetId !== dto.coverAssetId,
              ),
            }
          : {}),
      },
    );
    for (const assetId of removedAssetIds) {
      await this.assetsService.deleteAssetIfUnreferenced(assetId);
    }
    return toProductTemplateResponse(
      template,
      (asset) => this.assetsService.enrichAssetUrl(asset).url,
    );
  }
}

function getRemovedTemplateAssetIds(
  existingAssets: Array<{ asset_id: string; role: string }>,
  requested: {
    coverAssetId?: string | null;
    galleryAssetIds?: string[];
  },
) {
  const removed = new Set<string>();
  if (requested.coverAssetId !== undefined) {
    for (const asset of existingAssets) {
      if (asset.role === 'COVER' && asset.asset_id !== requested.coverAssetId) {
        removed.add(asset.asset_id);
      }
    }
  }
  if (requested.galleryAssetIds !== undefined) {
    const retained = new Set(requested.galleryAssetIds);
    for (const asset of existingAssets) {
      if (asset.role === 'GALLERY' && !retained.has(asset.asset_id)) {
        removed.add(asset.asset_id);
      }
    }
  }
  return [...removed];
}
