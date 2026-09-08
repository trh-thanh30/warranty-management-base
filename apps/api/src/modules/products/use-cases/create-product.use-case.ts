import { toSlug } from '@/common/helpers/string.util';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { buildProductAssets } from '@/modules/products/product-assets';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_method } from '@prisma/client';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: CreateProductDto) {
    if (
      !Number.isInteger(dto.warrantyDurationMonths) ||
      dto.warrantyDurationMonths < 1
    ) {
      throw new BadRequestError(
        'Warranty duration is required',
        'BAD_REQUEST',
        { code: 'WARRANTY_DURATION_REQUIRED' },
      );
    }

    const requestedProductCode = dto.productCode?.trim() || null;
    const productCode = requestedProductCode
      ? await this.resolveRequestedProductCode(requestedProductCode)
      : await this.generateProductCodeUseCase.execute();

    const category =
      await this.productsRepository.findActiveProductCategoryById(
        dto.categoryId,
      );
    if (!category) {
      throw new NotFoundError('Product category not found');
    }

    const product = await this.productsRepository.create({
      product_code: productCode,
      // Serial/VIN belongs to an issued Warranty, not catalogue Product.
      display_name: dto.name.trim(),
      slug: `${toSlug(dto.name)}-${productCode.toLowerCase()}`,
      brand: dto.brand?.trim() || null,
      model: dto.model?.trim() || null,
      model_year: dto.modelYear,
      description: dto.description?.trim() || null,
      metadata: this.toJsonObject({
        ...(dto.catalogueMetadata ?? {}),
        ...(dto.metadata ?? {}),
      }),
      status: dto.status ?? product_status.ACTIVE,
      warranty_duration_months: dto.warrantyDurationMonths,
      warranty_method: warranty_method.REPAIR,
      warranty_terms: dto.warrantyTerms?.trim() || null,
      category_ref: { connect: { id: dto.categoryId } },
      assets: buildProductAssets(dto.coverAssetId, dto.galleryAssetIds),
      ownerships: undefined,
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }

  private async resolveRequestedProductCode(productCode: string) {
    const existing =
      await this.productsRepository.findByProductCode(productCode);
    if (existing) {
      throw new ConflictError('Product code already exists');
    }
    return productCode;
  }

  private toJsonObject(
    value: Record<string, unknown> | undefined,
  ): Prisma.InputJsonObject | undefined {
    return value as Prisma.InputJsonObject | undefined;
  }

  // private toPhysicalProductMetadata(
  //   metadata: Record<string, unknown> | undefined,
  // ): Prisma.InputJsonObject | undefined {
  //   const installationPosition = metadata?.installationPosition;
  //   if (
  //     typeof installationPosition !== 'string' ||
  //     installationPosition.trim().length === 0
  //   ) {
  //     return undefined;
  //   }
  //   return { installationPosition: installationPosition.trim() };
  // }
}
