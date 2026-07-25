import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { createProductSlug } from '@/modules/products/product-slug.utils';
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
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: CreateProductDto) {
    if (dto.templateId && dto.createTemplate) {
      throw new BadRequestError(
        'Choose an existing product template or create a new one',
      );
    }

    const productCode = await this.generateProductCodeUseCase.execute();
    const selectedTemplate = dto.templateId
      ? await this.productTemplatesRepository.findActiveById(dto.templateId)
      : null;
    if (dto.templateId && !selectedTemplate) {
      throw new NotFoundError('Product template not found');
    }
    if (!selectedTemplate && (!dto.name || !dto.category || !dto.categoryId)) {
      throw new BadRequestError('Product shared information is required');
    }

    const effectiveName = selectedTemplate?.name ?? dto.name!;
    const slug =
      dto.slug?.trim() || createProductSlug(effectiveName, productCode);
    const productWithSlug = await this.productsRepository.findBySlug(slug);
    if (productWithSlug) {
      throw new ConflictError('Product slug already exists');
    }

    const categoryRef = await this.resolveProductCategory(
      selectedTemplate?.category_id ?? dto.categoryId ?? '',
    );
    const coverAsset =
      !selectedTemplate && dto.coverAssetId
        ? await this.prismaService.asset.findUnique({
            where: { id: dto.coverAssetId },
          })
        : null;

    if (
      !selectedTemplate &&
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

    const product = await this.prismaService.$transaction(async (tx) => {
      const template =
        selectedTemplate ??
        (dto.createTemplate
          ? await this.productTemplatesRepository.create(
              {
                name: dto.name!,
                category: dto.category!,
                brand: dto.brand,
                model: dto.model,
                manufacture_year: dto.manufactureYear,
                description: dto.description,
                category_ref: { connect: { id: categoryRef.id } },
                metadata: toTemplateMetadata(dto.metadata),
                assets: coverAsset
                  ? {
                      create: {
                        asset: { connect: { id: coverAsset.id } },
                        role: 'COVER',
                        alt_text: dto.name!,
                      },
                    }
                  : undefined,
              },
              tx,
            )
          : null);
      return tx.product.create({
        data: {
          product_code: productCode,
          slug,
          warranty_code: null,
          serial_number: dto.serialNumber,
          name: template?.name ?? dto.name!,
          category: template?.category ?? dto.category!,
          brand: template?.brand ?? dto.brand,
          model: template?.model ?? dto.model,
          manufacture_year: template?.manufacture_year ?? dto.manufactureYear,
          description: template?.description ?? dto.description,
          status: dto.status ?? product_status.ACTIVE,
          is_published: dto.isPublished ?? false,
          published_at: dto.isPublished ? new Date() : null,
          category_ref: { connect: { id: categoryRef.id } },
          template: template ? { connect: { id: template.id } } : undefined,
          metadata: template
            ? toPhysicalProductMetadata(dto.metadata)
            : (dto.metadata as Prisma.InputJsonObject | undefined),
          assets:
            !template && coverAsset
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
              duration_months: template?.default_warranty_duration_months ?? 36,
              terms: template?.default_warranty_terms,
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
          category_ref: true,
          template: {
            include: {
              assets: {
                include: { asset: true },
                orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
              },
              category_ref: true,
            },
          },
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

function toTemplateMetadata(
  metadata: Record<string, unknown> | undefined,
): Prisma.InputJsonObject | undefined {
  if (!metadata) return undefined;
  const templateMetadata = { ...metadata };
  delete templateMetadata.installationPosition;
  return Object.keys(templateMetadata).length > 0
    ? (templateMetadata as Prisma.InputJsonObject)
    : undefined;
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
