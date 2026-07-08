import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';
import {
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
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
  ) {}

  async execute(dto: CreateProductDto) {
    const warrantyCode = await this.resolveWarrantyCode(dto);
    const productCode = await this.generateProductCode();
    const durationMonths = dto.durationMonths ?? 36;
    const activatedAt = dto.activatedAt ? new Date(dto.activatedAt) : null;
    const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : null;
    const startDate = activatedAt ?? purchaseDate;
    const categoryRef = await this.resolveProductCategory(dto.categoryId);

    if (dto.serialNumber) {
      const existingSerial = await this.productsRepository.findBySerialNumber(
        dto.serialNumber,
      );
      if (existingSerial) {
        throw new ConflictError('Serial number already exists');
      }
    }

    const customer = dto.customerId
      ? await this.prismaService.customer.findUnique({
          where: { id: dto.customerId },
        })
      : null;

    if (dto.customerId && !customer) {
      throw new NotFoundError('Customer not found');
    }

    const product = await this.prismaService.product.create({
      data: {
        product_code: productCode,
        warranty_code: warrantyCode,
        serial_number: dto.serialNumber,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        manufacture_year: dto.manufactureYear,
        description: dto.description,
        status: dto.status ?? product_status.ACTIVE,
        category_ref: categoryRef
          ? { connect: { id: categoryRef.id } }
          : undefined,
        metadata: dto.metadata as Prisma.InputJsonObject | undefined,
        warranty: {
          create: {
            warranty_code: warrantyCode,
            duration_months: durationMonths,
            start_date: startDate,
            end_date: startDate
              ? this.addMonths(startDate, durationMonths)
              : null,
            status: startDate ? warranty_status.ACTIVE : warranty_status.DRAFT,
            terms: dto.warrantyTerms,
          },
        },
        ownerships: customer
          ? {
              create: {
                customer: { connect: { id: customer.id } },
                owner_user: { connect: { id: customer.user_id } },
                purchase_date: purchaseDate,
                activated_at: activatedAt,
                is_current_owner: true,
              },
            }
          : undefined,
      },
      include: {
        ownerships: {
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
        warranty: true,
      },
    });

    return toProductResponse(product);
  }

  private async resolveWarrantyCode(dto: CreateProductDto) {
    if (dto.autoGenerateWarrantyCode !== false && !dto.warrantyCode) {
      return this.generateWarrantyCodeUseCase.execute();
    }

    const warrantyCode = dto.warrantyCode?.trim().toUpperCase();
    if (!warrantyCode) {
      throw new BadRequestError('Warranty code is required');
    }

    if (!/^[A-Z0-9-]{6,64}$/.test(warrantyCode)) {
      throw new BadRequestError('Warranty code format is invalid');
    }

    const existingWarrantyCode =
      await this.productsRepository.findByWarrantyCode(warrantyCode);
    if (existingWarrantyCode) {
      throw new ConflictError('Warranty code already exists');
    }

    return warrantyCode;
  }

  private async resolveProductCategory(categoryId: string | undefined) {
    if (!categoryId) {
      return null;
    }

    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.type !== category_type.PRODUCT) {
      throw new NotFoundError('Product category not found');
    }

    return category;
  }

  private async generateProductCode() {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `PRD-${year}-${suffix}`;
      const existing = await this.productsRepository.findByProductCode(code);
      if (!existing) {
        return code;
      }
    }

    throw new BadRequestError('Could not generate a unique product code');
  }

  private addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }
}
