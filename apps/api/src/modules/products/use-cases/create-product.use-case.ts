import { ConflictError, NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsRepository: ProductsRepository,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: CreateProductDto) {
    const selectedTemplate =
      await this.productTemplatesRepository.findActiveById(dto.templateId);
    if (!selectedTemplate) {
      throw new NotFoundError('Product template not found');
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

    const categoryId = dto.categoryId ?? selectedTemplate.category_id;
    if (dto.categoryId) {
      const category =
        await this.productsRepository.findActiveProductCategoryById(categoryId);
      if (!category) {
        throw new NotFoundError('Product category not found');
      }
    }

    const product = await this.prismaService.$transaction(async (tx) => {
      const warrantyCode = await this.generateWarrantyCodeUseCase.execute(
        new Date(),
        tx,
      );

      return tx.product.create({
        data: {
          product_code: productCode,
          serial_number: dto.serialNumber,
          display_name: dto.displayName?.trim() || null,
          status: dto.status ?? product_status.ACTIVE,
          template: { connect: { id: selectedTemplate.id } },
          category_ref: { connect: { id: categoryId } },
          metadata: toPhysicalProductMetadata(dto.metadata),
          warranty: {
            create: {
              warranty_code: warrantyCode,
              duration_months:
                selectedTemplate.default_warranty_duration_months,
              terms: selectedTemplate.default_warranty_terms,
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
          template: {
            include: {
              assets: {
                include: { asset: true },
                orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
              },
              category_ref: true,
            },
          },
          category_ref: true,
          ownerships: {
            include: { customer: true },
            orderBy: { created_at: 'desc' },
          },
          warranty: true,
        },
      });
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
