import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ManualWarrantyActivationDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import {
  category_type,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

@Injectable()
export class ManualWarrantyActivationUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(dto: ManualWarrantyActivationDto) {
    const email = dto.customer.email.trim().toLowerCase();
    const phone = dto.customer.phone.trim();
    const requestedWarrantyCode = dto.warranty.warrantyCode
      ?.trim()
      .toUpperCase();
    const activatedAt = new Date(dto.warranty.activatedAt);
    const purchaseDate = dto.warranty.purchaseDate
      ? new Date(dto.warranty.purchaseDate)
      : activatedAt;

    if (purchaseDate > activatedAt) {
      throw new BadRequestError('Purchase date must be before activation date');
    }

    const productWithRelations = await this.prismaService.$transaction(
      async (tx) => {
        await this.ensureCategoryExists(tx, dto.product.categoryId);

        const customer = await this.resolveCustomer(tx, {
          address: dto.customer.address.trim(),
          email,
          fullName: dto.customer.fullName.trim(),
          phone,
        });

        const existingProduct = dto.product.id
          ? await tx.product.findUnique({
              where: { id: dto.product.id },
              include: { warranty: true },
            })
          : null;

        if (
          dto.product.id &&
          (!existingProduct || existingProduct.deleted_at)
        ) {
          throw new NotFoundError('Product not found');
        }

        const warrantyCode =
          requestedWarrantyCode ??
          existingProduct?.warranty_code ??
          (await this.generateWarrantyCode(tx));

        await this.ensureProductInputsAvailable(tx, dto, warrantyCode);

        if (existingProduct) {
          if (!existingProduct.warranty) {
            throw new NotFoundError('Warranty not found');
          }

          await tx.productOwnership.updateMany({
            where: {
              product_id: existingProduct.id,
              is_current_owner: true,
            },
            data: { ended_at: activatedAt, is_current_owner: false },
          });

          return tx.product.update({
            where: { id: existingProduct.id },
            data: {
              warranty_code: warrantyCode,
              serial_number: optionalText(dto.product.serialNumber),
              name: dto.product.name.trim(),
              category: dto.product.category,
              category_id: optionalText(dto.product.categoryId),
              brand: optionalText(dto.product.brand),
              model: optionalText(dto.product.model),
              manufacture_year: dto.product.manufactureYear,
              description: optionalText(dto.product.description),
              status: product_status.ACTIVE,
              ownerships: {
                create: {
                  customer: { connect: { id: customer.id } },
                  owner_user: customer.user_id
                    ? { connect: { id: customer.user_id } }
                    : undefined,
                  purchase_date: purchaseDate,
                  activated_at: activatedAt,
                  is_current_owner: true,
                },
              },
              warranty: {
                update: {
                  warranty_code: warrantyCode,
                  start_date: activatedAt,
                  end_date: this.addMonths(
                    activatedAt,
                    dto.warranty.durationMonths,
                  ),
                  duration_months: dto.warranty.durationMonths,
                  status: warranty_status.ACTIVE,
                  terms: optionalText(dto.warranty.terms),
                  metadata: {
                    source: 'manual_warranty_activation',
                    certificateEmailStatus: 'PENDING_TEMPLATE',
                  } satisfies Prisma.InputJsonObject,
                },
              },
            },
            include: {
              ownerships: {
                include: { customer: true },
                orderBy: { created_at: 'desc' },
              },
              warranty: true,
            },
          });
        }

        const productCode = await this.generateProductCode(tx);

        return tx.product.create({
          data: {
            product_code: productCode,
            warranty_code: warrantyCode,
            serial_number: optionalText(dto.product.serialNumber),
            name: dto.product.name.trim(),
            category: dto.product.category,
            category_id: optionalText(dto.product.categoryId),
            brand: optionalText(dto.product.brand),
            model: optionalText(dto.product.model),
            manufacture_year: dto.product.manufactureYear,
            description: optionalText(dto.product.description),
            status: product_status.ACTIVE,
            metadata: {
              source: 'manual_warranty_activation',
            } satisfies Prisma.InputJsonObject,
            ownerships: {
              create: {
                customer: { connect: { id: customer.id } },
                owner_user: customer.user_id
                  ? { connect: { id: customer.user_id } }
                  : undefined,
                purchase_date: purchaseDate,
                activated_at: activatedAt,
                is_current_owner: true,
              },
            },
            warranty: {
              create: {
                warranty_code: warrantyCode,
                start_date: activatedAt,
                end_date: this.addMonths(
                  activatedAt,
                  dto.warranty.durationMonths,
                ),
                duration_months: dto.warranty.durationMonths,
                status: warranty_status.ACTIVE,
                terms: optionalText(dto.warranty.terms),
                metadata: {
                  source: 'manual_warranty_activation',
                  certificateEmailStatus: 'PENDING_TEMPLATE',
                } satisfies Prisma.InputJsonObject,
              },
            },
          },
          include: {
            ownerships: {
              include: { customer: true },
              orderBy: { created_at: 'desc' },
            },
            warranty: true,
          },
        });
      },
    );

    const currentOwnership = productWithRelations.ownerships.find(
      (ownership) => ownership.is_current_owner,
    );
    const customer = currentOwnership?.customer;
    const warranty = productWithRelations.warranty;

    if (!customer || !warranty) {
      throw new BadRequestError('Manual warranty activation failed');
    }

    return {
      customer: {
        id: customer.id,
        customerCode: customer.customer_code,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      product: {
        id: productWithRelations.id,
        productCode: productWithRelations.product_code,
        warrantyCode: productWithRelations.warranty_code,
        serialNumber: productWithRelations.serial_number,
        name: productWithRelations.name,
        category: productWithRelations.category,
        brand: productWithRelations.brand,
        model: productWithRelations.model,
      },
      warranty: toWarrantyResponse(warranty),
    };
  }

  private async ensureProductInputsAvailable(
    tx: Prisma.TransactionClient,
    dto: ManualWarrantyActivationDto,
    warrantyCode: string,
  ) {
    const [existingWarrantyCode, existingSerial] = await Promise.all([
      tx.product.findUnique({
        where: { warranty_code: warrantyCode },
      }),
      optionalText(dto.product.serialNumber)
        ? tx.product.findUnique({
            where: { serial_number: optionalText(dto.product.serialNumber) },
          })
        : null,
    ]);

    if (
      existingWarrantyCode &&
      (!dto.product.id || existingWarrantyCode.id !== dto.product.id)
    ) {
      throw new ConflictError('Warranty code already exists');
    }

    if (
      existingSerial &&
      (!dto.product.id || existingSerial.id !== dto.product.id)
    ) {
      throw new ConflictError('Serial number already exists');
    }
  }

  private async ensureCategoryExists(
    tx: Prisma.TransactionClient,
    categoryId?: string,
  ) {
    if (!categoryId) return;

    const category = await tx.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.type !== category_type.PRODUCT) {
      throw new NotFoundError('Product category not found');
    }
  }

  private async resolveCustomer(
    tx: Prisma.TransactionClient,
    input: {
      address: string;
      email: string;
      fullName: string;
      phone: string;
    },
  ) {
    const [customerByEmail, customerByPhone] = await Promise.all([
      tx.customer.findUnique({ where: { email: input.email } }),
      tx.customer.findUnique({ where: { phone: input.phone } }),
    ]);

    if (
      customerByEmail &&
      customerByPhone &&
      customerByEmail.id !== customerByPhone.id
    ) {
      throw new ConflictError(
        'Customer email and phone belong to different customers',
      );
    }

    const existingCustomer = customerByEmail ?? customerByPhone;
    if (existingCustomer) {
      return tx.customer.update({
        where: { id: existingCustomer.id },
        data: {
          full_name: input.fullName,
          phone: input.phone,
          email: input.email,
          address: input.address,
        },
      });
    }

    return tx.customer.create({
      data: {
        customer_code: await this.generateCustomerCode(tx),
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
        address: input.address,
      },
    });
  }

  private async generateCustomerCode(tx: Prisma.TransactionClient) {
    const prefix = 'CUS';
    const padLength = 6;
    const lastCustomer = await tx.customer.findFirst({
      where: { customer_code: { startsWith: prefix } },
      orderBy: { customer_code: 'desc' },
      select: { customer_code: true },
    });
    const nextNumber = this.getNextNumber(
      lastCustomer?.customer_code,
      prefix,
      padLength,
    );
    return `${prefix}${nextNumber.toString().padStart(padLength, '0')}`;
  }

  private async generateProductCode(tx: Prisma.TransactionClient) {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `PRD-${year}-${suffix}`;
      const existing = await tx.product.findUnique({
        where: { product_code: code },
      });
      if (!existing) return code;
    }

    throw new BadRequestError('Could not generate a unique product code');
  }

  private async generateWarrantyCode(tx?: Prisma.TransactionClient) {
    const year = new Date().getFullYear();
    const client = tx ?? this.prismaService;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `WM-${year}-${suffix}`;
      const existing = await client.product.findUnique({
        where: { warranty_code: code },
      });
      if (!existing) return code;
    }

    throw new BadRequestError('Could not generate a unique warranty code');
  }

  private getNextNumber(code: string | undefined, prefix: string, pad: number) {
    if (!code) return 1;

    const match = code.match(new RegExp(`^${prefix}(\\d{${pad},})$`));
    if (!match) return 1;

    return Number.parseInt(match[1], 10) + 1;
  }

  private addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
