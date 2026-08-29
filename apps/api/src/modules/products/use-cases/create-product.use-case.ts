import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { toSlug } from '@/common/helpers/string.util';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { buildProductAssets } from '@/modules/products/product-assets';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
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

    if (dto.serialNumber) {
      const existingSerial = await this.productsRepository.findBySerialNumber(
        dto.serialNumber,
      );
      if (existingSerial) {
        throw new ConflictError('Serial number already exists');
      }
    }

    const category =
      await this.productsRepository.findActiveProductCategoryById(
        dto.categoryId,
      );
    if (!category) {
      throw new NotFoundError('Product category not found');
    }

    const requestedWarrantyCode =
      dto.warrantyCode?.trim().toUpperCase() || null;
    const resolvedWarrantyCode = requestedWarrantyCode
      ? await this.resolveRequestedWarrantyCode(requestedWarrantyCode)
      : null;

    const warrantyCode =
      resolvedWarrantyCode ??
      (await this.generateWarrantyCodeUseCase.execute(new Date()));
    const product = await this.productsRepository.create({
      product_code: productCode,
      serial_number: dto.serialNumber,
      display_name: dto.displayName?.trim() || null,
      catalogue_name: dto.name.trim(),
      catalogue_sku: productCode,
      catalogue_slug: `${toSlug(dto.name)}-${productCode.toLowerCase()}`,
      catalogue_brand: dto.brand?.trim() || null,
      catalogue_model: dto.model?.trim() || null,
      catalogue_model_year: dto.modelYear,
      catalogue_description: dto.description?.trim() || null,
      catalogue_metadata: toJsonObject(dto.catalogueMetadata),
      status: dto.status ?? product_status.ACTIVE,
      category_ref: { connect: { id: dto.categoryId } },
      metadata: toPhysicalProductMetadata(dto.metadata),
      assets: buildProductAssets(dto.coverAssetId, dto.galleryAssetIds),
      warranty: {
        create: {
          warranty_code: warrantyCode,
          duration_months: dto.warrantyDurationMonths,
          terms: dto.warrantyTerms?.trim() || null,
          start_date: null,
          end_date: null,
          status: warranty_status.DRAFT,
        },
      },
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

  private async resolveRequestedWarrantyCode(warrantyCode: string) {
    const existing =
      await this.productsRepository.findByWarrantyCode(warrantyCode);
    if (existing) {
      throw new ConflictError('Warranty code already exists');
    }
    return warrantyCode;
  }
}

function toJsonObject(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonObject | undefined {
  return value as Prisma.InputJsonObject | undefined;
}

function toPhysicalProductMetadata(
  metadata: Record<string, unknown> | undefined,
): Prisma.InputJsonObject | undefined {
  const installationPosition = metadata?.installationPosition;
  if (
    typeof installationPosition !== 'string' ||
    installationPosition.trim().length === 0
  ) {
    return undefined;
  }
  return { installationPosition: installationPosition.trim() };
}
