import { AssetsService } from '@/modules/assets/assets.service';
import { CreateProductTemplateDto } from '@/modules/product-templates/dto/create-product-template.dto';
import {
  normalizeSku,
  resolveProductTemplateCategory,
  toTemplateJson,
  validateProductTemplateAssets,
} from '@/modules/product-templates/product-template-input';
import { toProductTemplateResponse } from '@/modules/product-templates/product-templates.types';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { GenerateProductTemplateSkuUseCase } from '@/modules/product-templates/use-cases/generate-product-template-sku.use-case';
import { GenerateProductTemplateSlugUseCase } from '@/modules/product-templates/use-cases/generate-product-template-slug.use-case';
import { Injectable } from '@nestjs/common';
import { ConflictError } from '@/common/response';

@Injectable()
export class CreateProductTemplateUseCase {
  constructor(
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly assetsService: AssetsService,
    private readonly generateProductTemplateSkuUseCase: GenerateProductTemplateSkuUseCase,
    private readonly generateProductTemplateSlugUseCase: GenerateProductTemplateSlugUseCase,
  ) {}

  async execute(dto: CreateProductTemplateDto) {
    const requestedSku = dto.sku?.trim();
    const requestedSlug = dto.slug?.trim();
    const [sku, slug] = await Promise.all([
      requestedSku
        ? Promise.resolve(normalizeSku(requestedSku))
        : this.generateProductTemplateSkuUseCase.execute(dto.name),
      requestedSlug
        ? Promise.resolve(requestedSlug)
        : this.generateProductTemplateSlugUseCase.execute(dto.name),
    ]);
    const [skuConflict, slugConflict] = await Promise.all([
      requestedSku ? this.productTemplatesRepository.findBySku(sku) : null,
      requestedSlug ? this.productTemplatesRepository.findBySlug(slug) : null,
    ]);
    if (skuConflict) {
      throw new ConflictError('Product template SKU already exists');
    }
    if (slugConflict) {
      throw new ConflictError('Product template slug already exists');
    }
    const category = await resolveProductTemplateCategory(
      this.productTemplatesRepository,
      dto.categoryId,
    );
    await validateProductTemplateAssets(
      this.productTemplatesRepository,
      dto.coverAssetId,
      dto.galleryAssetIds,
    );
    const galleryIds = (dto.galleryAssetIds ?? []).filter(
      (assetId) => assetId !== dto.coverAssetId,
    );
    const assetCreates = [
      ...(dto.coverAssetId
        ? [
            {
              asset: { connect: { id: dto.coverAssetId } },
              role: 'COVER' as const,
              sort_order: 0,
              alt_text: dto.name,
            },
          ]
        : []),
      ...galleryIds.map((assetId, sortOrder) => ({
        asset: { connect: { id: assetId } },
        role: 'GALLERY' as const,
        sort_order: sortOrder,
        alt_text: dto.name,
      })),
    ];
    const template = await this.productTemplatesRepository.create({
      sku,
      slug,
      name: dto.name,
      category_ref: { connect: { id: category.id } },
      brand: dto.brand,
      model: dto.model,
      model_year: dto.modelYear,
      description: dto.description,
      default_warranty_duration_months:
        dto.defaultWarrantyDurationMonths ?? null,
      default_warranty_terms: dto.defaultWarrantyTerms,
      metadata: toTemplateJson(dto.metadata),
      is_published: dto.isPublished ?? false,
      published_at: dto.isPublished ? new Date() : null,
      assets: assetCreates.length > 0 ? { create: assetCreates } : undefined,
    });

    return toProductTemplateResponse(
      template,
      (asset) => this.assetsService.enrichAssetUrl(asset).url,
    );
  }
}
