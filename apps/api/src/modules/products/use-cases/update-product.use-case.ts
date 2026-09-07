import { toSlug } from '@/common/helpers/string.util';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { buildProductAssets } from '@/modules/products/product-assets';
import { getProductCatalogue } from '@/modules/products/product-catalogue';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, product_asset_role } from '@prisma/client';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
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

    const product = await this.productsRepository.update(id, {
      product_code:
        requestedProductCode === existingProduct.product_code
          ? undefined
          : requestedProductCode,
      display_name:
        dto.name?.trim() ??
        (dto.displayName === undefined
          ? undefined
          : dto.displayName?.trim() || null),
      slug:
        dto.name || requestedProductCode
          ? `${toSlug(dto.name?.trim() || getProductCatalogue(existingProduct).name)}-${(requestedProductCode ?? existingProduct.product_code).toLowerCase()}`
          : undefined,
      brand: dto.brand === undefined ? undefined : dto.brand?.trim() || null,
      model: dto.model === undefined ? undefined : dto.model?.trim() || null,
      model_year: dto.modelYear,
      description:
        dto.description === undefined
          ? undefined
          : dto.description?.trim() || null,
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
      status: dto.status,
      // Serial/VIN is immutable catalogue-external data stored on Warranty.
      serial_number: undefined,
      warranty_duration_months: dto.warrantyDurationMonths,
      warranty_terms:
        dto.warrantyTerms === undefined
          ? undefined
          : dto.warrantyTerms?.trim() || null,
      metadata:
        dto.catalogueMetadata === undefined && dto.metadata === undefined
          ? undefined
          : this.toPhysicalProductMetadata(existingProduct.metadata, {
              ...(dto.catalogueMetadata ?? {}),
              ...(dto.metadata ?? {}),
            }),
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
      this.activationCodeCryptoService
        ? (ciphertext) => this.activationCodeCryptoService!.decrypt(ciphertext)
        : undefined,
    );
  }

  private toPhysicalProductMetadata(
    existingMetadata: Prisma.JsonValue,
    requestedMetadata: Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (requestedMetadata === undefined) return undefined;

    const next = this.isRecord(existingMetadata) ? { ...existingMetadata } : {};
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

  private isRecord(value: unknown): value is Record<string, Prisma.JsonValue> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
