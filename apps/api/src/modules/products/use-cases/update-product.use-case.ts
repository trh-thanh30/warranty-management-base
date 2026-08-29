import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { toSlug } from '@/common/helpers/string.util';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { getProductCatalogue } from '@/modules/products/product-catalogue';
import { buildProductAssets } from '@/modules/products/product-assets';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_asset_role, warranty_status } from '@prisma/client';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    const requestedProductCode =
      dto.productCode === undefined ? undefined : dto.productCode.trim();
    if (dto.productCode !== undefined && !requestedProductCode) {
      throw new BadRequestError('Product code is required');
    }
    if (
      requestedProductCode &&
      requestedProductCode !== existingProduct.product_code
    ) {
      const productWithCode =
        await this.productsRepository.findByProductCode(requestedProductCode);
      if (productWithCode && productWithCode.id !== id) {
        throw new ConflictError('Product code already exists');
      }
    }

    if (
      dto.serialNumber &&
      dto.serialNumber !== existingProduct.serial_number
    ) {
      const productWithSerial =
        await this.productsRepository.findBySerialNumber(dto.serialNumber);
      if (productWithSerial && productWithSerial.id !== id) {
        throw new ConflictError('Serial number already exists');
      }
    }

    const requestedCategoryId = dto.categoryId;
    if (
      requestedCategoryId &&
      requestedCategoryId !== existingProduct.category_id
    ) {
      const category =
        await this.productsRepository.findActiveProductCategoryById(
          requestedCategoryId,
        );
      if (!category) {
        throw new NotFoundError('Product category not found');
      }
    }

    const currentWarrantyCode = existingProduct.warranty?.warranty_code ?? null;
    const isWarrantyDurationChange =
      dto.warrantyDurationMonths !== undefined &&
      dto.warrantyDurationMonths !== existingProduct.warranty?.duration_months;
    if (
      isWarrantyDurationChange &&
      existingProduct.warranty &&
      existingProduct.warranty.status !== warranty_status.DRAFT
    ) {
      throw new BadRequestError(
        'Warranty duration can only be changed while warranty is draft',
        'BAD_REQUEST',
        { code: 'WARRANTY_DURATION_NOT_DRAFT' },
      );
    }

    const requestedWarrantyCode =
      dto.warrantyCode?.trim().toUpperCase() || null;
    const isWarrantyCodeReplacement =
      requestedWarrantyCode !== null &&
      requestedWarrantyCode !== currentWarrantyCode;

    let nextWarrantyCode: string | null = null;
    if (isWarrantyCodeReplacement) {
      if (
        existingProduct.warranty &&
        existingProduct.warranty.status !== warranty_status.DRAFT
      ) {
        throw new ConflictError(
          'Warranty code can only be changed while warranty is draft',
        );
      }
      if (existingProduct.warranty_activation_requests.length > 0) {
        throw new ConflictError(
          'Warranty code cannot be changed while an activation request is open',
        );
      }
      if (!/^[A-Z0-9-]{6,64}$/.test(requestedWarrantyCode)) {
        throw new BadRequestError('Warranty code is invalid');
      }

      const duplicate = await this.productsRepository.findByWarrantyCode(
        requestedWarrantyCode,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError('Warranty code already exists');
      }
      nextWarrantyCode = requestedWarrantyCode;
    } else if (!currentWarrantyCode) {
      nextWarrantyCode = await this.generateWarrantyCodeUseCase.execute();
    }

    let warranty: Prisma.ProductUpdateInput['warranty'];
    if (existingProduct.warranty) {
      const warrantyUpdate: {
        warranty_code?: string;
        duration_months?: number;
        terms?: string | null;
      } = {};
      if (nextWarrantyCode) {
        warrantyUpdate.warranty_code = nextWarrantyCode;
      }
      if (isWarrantyDurationChange) {
        warrantyUpdate.duration_months = dto.warrantyDurationMonths;
      }
      if (dto.warrantyTerms !== undefined) {
        warrantyUpdate.terms = dto.warrantyTerms?.trim() || null;
      }
      if (Object.keys(warrantyUpdate).length > 0) {
        warranty = { update: warrantyUpdate };
      }
    } else if (nextWarrantyCode) {
      const durationMonths = dto.warrantyDurationMonths;
      if (durationMonths === null || durationMonths === undefined) {
        throw new BadRequestError(
          'Warranty duration is required',
          'BAD_REQUEST',
          { code: 'WARRANTY_DURATION_REQUIRED' },
        );
      }
      warranty = {
        create: {
          warranty_code: nextWarrantyCode,
          duration_months: durationMonths,
          terms: dto.warrantyTerms?.trim() || null,
          start_date: null,
          end_date: null,
          status: warranty_status.DRAFT,
        },
      };
    }

    const product = await this.productsRepository.update(id, {
      product_code:
        requestedProductCode === existingProduct.product_code
          ? undefined
          : requestedProductCode,
      catalogue_name: dto.name?.trim(),
      catalogue_sku: requestedProductCode ? requestedProductCode : undefined,
      catalogue_slug:
        dto.name || requestedProductCode
          ? `${toSlug(dto.name?.trim() || getProductCatalogue(existingProduct).name)}-${(requestedProductCode ?? existingProduct.product_code).toLowerCase()}`
          : undefined,
      catalogue_brand:
        dto.brand === undefined ? undefined : dto.brand?.trim() || null,
      catalogue_model:
        dto.model === undefined ? undefined : dto.model?.trim() || null,
      catalogue_model_year: dto.modelYear,
      catalogue_description:
        dto.description === undefined
          ? undefined
          : dto.description?.trim() || null,
      catalogue_metadata:
        dto.catalogueMetadata === undefined
          ? undefined
          : dto.catalogueMetadata === null
            ? Prisma.JsonNull
            : (dto.catalogueMetadata as Prisma.InputJsonObject),
      assets:
        dto.coverAssetId !== undefined || dto.galleryAssetIds !== undefined
          ? {
              deleteMany: {
                role: {
                  in: [product_asset_role.COVER, product_asset_role.GALLERY],
                },
              },
              ...buildProductAssets(
                dto.coverAssetId ?? undefined,
                dto.galleryAssetIds,
              ),
            }
          : undefined,
      category_ref: requestedCategoryId
        ? { connect: { id: requestedCategoryId } }
        : undefined,
      display_name:
        dto.displayName === undefined
          ? undefined
          : dto.displayName?.trim() || null,
      status: dto.status,
      serial_number: dto.serialNumber,
      metadata: toPhysicalProductMetadata(
        existingProduct.metadata,
        dto.metadata,
      ),
      warranty,
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }
}

function toPhysicalProductMetadata(
  existingMetadata: Prisma.JsonValue,
  requestedMetadata: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
  if (requestedMetadata === undefined) return undefined;

  const next = isRecord(existingMetadata) ? { ...existingMetadata } : {};
  const installationPosition = requestedMetadata?.installationPosition;
  if (
    typeof installationPosition === 'string' &&
    installationPosition.trim().length > 0
  ) {
    next.installationPosition = installationPosition.trim();
  } else {
    delete next.installationPosition;
  }
  return next;
}

function isRecord(value: unknown): value is Record<string, Prisma.JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
