import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
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
    private readonly productsRepository: ProductsRepository,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly productTemplatesRepository: ProductTemplatesRepository,
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
      status: dto.status ?? product_status.ACTIVE,
      template: { connect: { id: selectedTemplate.id } },
      category_ref: { connect: { id: categoryId } },
      metadata: toPhysicalProductMetadata(dto.metadata),
      warranty: {
        create: {
          warranty_code: warrantyCode,
          duration_months: dto.warrantyDurationMonths,
          terms: selectedTemplate.default_warranty_terms,
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
