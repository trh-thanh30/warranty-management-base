import { ConflictError, NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
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

    if (dto.categoryId && dto.categoryId !== existingProduct.category_id) {
      const category =
        await this.productsRepository.findActiveProductCategoryById(
          dto.categoryId,
        );
      if (!category) {
        throw new NotFoundError('Product category not found');
      }
    }

    const product = await this.productsRepository.update(id, {
      category_ref: dto.categoryId
        ? { connect: { id: dto.categoryId } }
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
