import { ConflictError, NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { asset_type, category_type, Prisma } from '@prisma/client';
import { getRemovedMediaUrls } from '@repo/shared/utils';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly prismaService: PrismaService,
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

    const categoryRef =
      dto.categoryId === undefined
        ? null
        : await this.resolveProductCategory(dto.categoryId);

    if (dto.description !== undefined) {
      for (const url of getRemovedMediaUrls(
        existingProduct.description ?? '',
        dto.description ?? '',
      )) {
        await this.assetsService?.deleteAssetByUrl(url, {
          folder: 'rich-text',
          types: [asset_type.IMAGE, asset_type.VIDEO],
        });
      }
    }

    const product = await this.productsRepository.update(id, {
      name: dto.name,
      category: dto.category,
      brand: dto.brand,
      model: dto.model,
      manufacture_year: dto.manufactureYear,
      description: dto.description,
      status: dto.status,
      serial_number: dto.serialNumber,
      category_ref: categoryRef
        ? { connect: { id: categoryRef.id } }
        : undefined,
      metadata: dto.metadata as Prisma.InputJsonValue | undefined,
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }

  private async resolveProductCategory(categoryId: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.type !== category_type.PRODUCT) {
      throw new NotFoundError('Product category not found');
    }

    return category;
  }
}
