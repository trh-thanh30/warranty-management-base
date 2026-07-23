import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { Injectable } from '@nestjs/common';
import {
  asset_type,
  category_type,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsRepository: ProductsRepository,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: CreateProductDto) {
    const productCode = await this.generateProductCodeUseCase.execute();
    const categoryRef = await this.resolveProductCategory(dto.categoryId);
    const coverAsset = dto.coverAssetId
      ? await this.prismaService.asset.findUnique({
          where: { id: dto.coverAssetId },
        })
      : null;

    if (
      dto.coverAssetId &&
      (!coverAsset ||
        coverAsset.is_deleted ||
        coverAsset.type !== asset_type.IMAGE)
    ) {
      throw new NotFoundError('Product cover asset not found');
    }

    if (dto.serialNumber) {
      const existingSerial = await this.productsRepository.findBySerialNumber(
        dto.serialNumber,
      );
      if (existingSerial) {
        throw new ConflictError('Serial number already exists');
      }
    }

    const product = await this.prismaService.product.create({
      data: {
        product_code: productCode,
        warranty_code: null,
        serial_number: dto.serialNumber,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        manufacture_year: dto.manufactureYear,
        description: dto.description,
        status: dto.status ?? product_status.ACTIVE,
        category_ref: { connect: { id: categoryRef.id } },
        metadata: dto.metadata as Prisma.InputJsonObject | undefined,
        assets: coverAsset
          ? {
              create: {
                asset: { connect: { id: coverAsset.id } },
                role: 'COVER',
                alt_text: dto.name,
              },
            }
          : undefined,
        warranty: {
          create: {
            warranty_code: null,
            duration_months: 36,
            start_date: null,
            end_date: null,
            status: warranty_status.DRAFT,
          },
        },
        ownerships: undefined,
      },
      include: {
        assets: {
          include: { asset: true },
          orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
        },
        ownerships: {
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
        warranty: true,
      },
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }

  private async resolveProductCategory(categoryId: string) {
    if (!categoryId) {
      throw new BadRequestError('Product category is required');
    }

    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.type !== category_type.PRODUCT) {
      throw new NotFoundError('Product category not found');
    }

    return category;
  }
}
