import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { createProductSlug } from '@/modules/products/product-slug.utils';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { ManualWarrantyActivationDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import {
  category_type,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

const manualActivationProductInclude = {
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' },
  },
  warranty: true,
} satisfies Prisma.ProductInclude;

type ManualActivationProduct = Prisma.ProductGetPayload<{
  include: typeof manualActivationProductInclude;
}>;

@Injectable()
export class ManualWarrantyActivationUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
  ) {}

  async execute(
    dto: ManualWarrantyActivationDto,
    context: { activatedByUserId?: string } = {},
  ) {
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
          (await this.generateWarrantyCodeUseCase.execute(new Date(), tx));

        await this.ensureProductInputsAvailable(tx, dto, warrantyCode);

        let productWithRelations: ManualActivationProduct;

        if (existingProduct) {
          if (!existingProduct.warranty) {
            throw new NotFoundError('Warranty not found');
          }
          if (existingProduct.warranty.status !== warranty_status.DRAFT) {
            throw new BadRequestError(
              'Warranty is not eligible for activation',
              'BAD_REQUEST',
              { code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION' },
            );
          }

          await tx.productOwnership.updateMany({
            where: {
              product_id: existingProduct.id,
              is_current_owner: true,
            },
            data: { ended_at: activatedAt, is_current_owner: false },
          });

          productWithRelations = await tx.product.update({
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
                  activated_at: null,
                  is_current_owner: true,
                },
              },
              warranty: {
                update: {
                  warranty_code: warrantyCode,
                  duration_months: dto.warranty.durationMonths,
                  terms: optionalText(dto.warranty.terms),
                  metadata: {
                    source: 'manual_warranty_activation',
                    certificateEmailStatus: 'PENDING_TEMPLATE',
                  } satisfies Prisma.InputJsonObject,
                },
              },
            },
            include: manualActivationProductInclude,
          });
        } else {
          const productCode = await this.generateProductCodeUseCase.execute(
            new Date(),
            tx,
          );

          productWithRelations = await tx.product.create({
            data: {
              product_code: productCode,
              slug: createProductSlug(dto.product.name, productCode),
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
                  activated_at: null,
                  is_current_owner: true,
                },
              },
              warranty: {
                create: {
                  warranty_code: warrantyCode,
                  duration_months: dto.warranty.durationMonths,
                  status: warranty_status.DRAFT,
                  terms: optionalText(dto.warranty.terms),
                  metadata: {
                    source: 'manual_warranty_activation',
                    certificateEmailStatus: 'PENDING_TEMPLATE',
                  } satisfies Prisma.InputJsonObject,
                },
              },
            },
            include: manualActivationProductInclude,
          });
        }

        if (!productWithRelations.warranty) {
          throw new NotFoundError('Warranty not found');
        }

        const activatedWarranty =
          await this.warrantyLifecycleService.activateDraftWarranty(tx, {
            activatedByUserId: context.activatedByUserId,
            startDate: activatedAt,
            warrantyId: productWithRelations.warranty.id,
          });

        return { ...productWithRelations, warranty: activatedWarranty };
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

    await this.issueWarrantyCertificateUseCase.execute({
      recipientEmail: email,
      warrantyId: warranty.id,
    });

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
        customer_code: await this.generateCustomerCodeUseCase.execute(tx),
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
        address: input.address,
      },
    });
  }
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
