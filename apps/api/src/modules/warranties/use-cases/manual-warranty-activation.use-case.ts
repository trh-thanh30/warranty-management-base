import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import {
  DealerAccessActor,
  DealerAccessPolicy,
} from '@/modules/dealers/service/dealer-access.policy';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { ManualWarrantyActivationDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { WarrantyTransactionRepository } from '@/modules/warranties/repository/warranty-transaction.repository';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import {
  ManualActivationProduct,
  toWarrantyResponse,
} from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualWarrantyActivationUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
    private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    dto: ManualWarrantyActivationDto,
    context: {
      activatedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
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

    if (context.actor) {
      const warranty = dto.product.id
        ? await this.warrantiesRepository.findByProductId(dto.product.id)
        : null;
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        context.actor,
        warranty?.dealer_id,
      );
    }

    const productWithRelations =
      await this.warrantiesRepository.withTransaction(async (repository) => {
        const customer = await this.resolveCustomer(repository, {
          address: dto.customer.address.trim(),
          email,
          fullName: dto.customer.fullName.trim(),
          phone,
        });

        const existingProduct = dto.product.id
          ? await repository.findManualActivationProduct(dto.product.id)
          : null;

        if (dto.product.id && (!existingProduct || existingProduct.deletedAt)) {
          throw new NotFoundError('Product not found');
        }

        const warrantyCode =
          requestedWarrantyCode ??
          (await this.generateWarrantyCodeUseCase.execute(new Date()));

        await this.ensureWarrantyCodeAvailable(repository, warrantyCode);

        let productWithRelations: ManualActivationProduct;

        if (existingProduct) {
          productWithRelations = await repository.updateManualActivationProduct(
            {
              customerId: customer.id,
              ownerUserId: customer.userId,
              productId: existingProduct.id,
              purchaseDate,
              displayName: optionalText(dto.product.displayName),
              warrantyCode,
              warrantyDurationMonths: dto.warranty.durationMonths,
              warrantyTerms: optionalText(dto.warranty.terms),
            },
          );
        } else {
          if (!dto.product.categoryId || !dto.product.name) {
            throw new BadRequestError(
              'Product category and name are required for a new product',
            );
          }
          const categoryIsEligible = await repository.isActiveProductCategory(
            dto.product.categoryId,
          );
          if (!categoryIsEligible) {
            throw new BadRequestError(
              'Product category must be an active product category',
              'BAD_REQUEST',
              { code: 'PRODUCT_CATEGORY_NOT_ELIGIBLE' },
            );
          }
          const productCode = await this.generateProductCodeUseCase.execute(
            new Date(),
          );

          productWithRelations = await repository.createManualActivationProduct(
            {
              brand: optionalText(dto.product.brand),
              categoryId: dto.product.categoryId,
              customerId: customer.id,
              displayName: optionalText(dto.product.displayName),
              model: optionalText(dto.product.model),
              name: dto.product.name,
              ownerUserId: customer.userId,
              productCode,
              purchaseDate,
              warrantyCode,
              warrantyDurationMonths: dto.warranty.durationMonths,
              warrantyTerms: optionalText(dto.warranty.terms),
            },
          );
        }

        if (!productWithRelations.warranty) {
          throw new NotFoundError('Warranty not found');
        }

        const activatedWarranty =
          await this.warrantyLifecycleService.activateDraftWarranty(
            repository,
            {
              activatedByUserId: context.activatedByUserId,
              startDate: activatedAt,
              warrantyId: productWithRelations.warranty.id,
            },
          );

        return { ...productWithRelations, warranty: activatedWarranty };
      });

    const currentOwnership = productWithRelations.ownerships.find(
      (ownership) => ownership.isCurrentOwner,
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
        customerCode: customer.customerCode,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      product: {
        id: productWithRelations.id,
        productCode: productWithRelations.productCode,
        warrantyCode: warranty.warrantyCode,
        displayName: productWithRelations.displayName,
        serialNumber: productWithRelations.serialNumber,
        name: productWithRelations.catalogue.name,
        brand: productWithRelations.catalogue.brand,
        model: productWithRelations.catalogue.model,
      },
      warranty: toWarrantyResponse(warranty),
    };
  }

  private async ensureWarrantyCodeAvailable(
    repository: WarrantyTransactionRepository,
    warrantyCode: string,
  ) {
    const existingWarrantyCode =
      await repository.findWarrantyByCode(warrantyCode);

    if (existingWarrantyCode) {
      throw new ConflictError('Warranty code already exists');
    }
  }

  private async resolveCustomer(
    repository: WarrantyTransactionRepository,
    input: {
      address: string;
      email: string;
      fullName: string;
      phone: string;
    },
  ) {
    const existingCustomer = await repository.findCustomerByPhone(input.phone);
    if (existingCustomer) {
      return repository.updateCustomer(existingCustomer.id, input);
    }

    return repository.createCustomer({
      ...input,
      customerCode: await this.generateCustomerCodeUseCase.execute(),
    });
  }
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
