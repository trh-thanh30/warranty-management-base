import { PermissionService } from '@/common/permissions/permissions.service';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@/common/response';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import {
  getProductCatalogue,
  getProductDisplayName,
} from '@/modules/products/product-catalogue';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { Injectable, Optional } from '@nestjs/common';
import {
  permission_key,
  product_status,
  user_role,
  warranty_activation_request_source,
  warranty_status,
} from '@prisma/client';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import type { UpdateWarrantyActivationRequestContext } from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import { buildWarrantyActivationRequestFullAddress } from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';

@Injectable()
export class CreateAdminWarrantyActivationRequestUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly customersRepository: CustomersRepository,
    @Optional()
    private readonly permissionService?: PermissionService,
  ) {}

  async execute(
    dto: CreateAdminWarrantyActivationRequestDto,
    context: {
      createdByUserId?: string;
      actor?: DealerAccessActor;
      updateRequest?: UpdateWarrantyActivationRequestContext;
    } = {},
  ) {
    const customer = await this.customersRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found', 'NOT_FOUND', {
        code: 'CUSTOMER_NOT_FOUND',
        customerId: dto.customerId,
      });
    }

    if (dto.updateCustomerProfile) {
      const canUpdateCustomer =
        context.actor &&
        this.permissionService &&
        (await this.permissionService.hasPermission(
          context.actor.id,
          context.actor.role as user_role,
          permission_key.CUSTOMER_UPDATE,
        ));
      if (!canUpdateCustomer) {
        throw new ForbiddenError(
          'Customer update permission is required',
          'CUSTOMER_UPDATE_REQUIRED',
        );
      }
    }

    const submittedBirthdate = dto.customerBirthdate
      ? new Date(dto.customerBirthdate)
      : undefined;
    const effectiveBirthdate = context.updateRequest
      ? (submittedBirthdate ?? null)
      : (submittedBirthdate ?? customer.birthdate);
    const customerDto = {
      ...dto,
      customerBirthdate: effectiveBirthdate
        ? effectiveBirthdate.toISOString().slice(0, 10)
        : undefined,
      customerEmail: dto.customerEmail?.trim() || undefined,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
    };
    const createContext = {
      createdByUserId: context.createdByUserId,
      actor: context.actor,
      source: warranty_activation_request_source.ADMIN_PORTAL,
      customerProfile: {
        id: customer.id,
        update: dto.updateCustomerProfile
          ? {
              address: buildWarrantyActivationRequestFullAddress(dto) || null,
              birthdate: submittedBirthdate ?? null,
              email: dto.customerEmail?.trim() || null,
              fullName: dto.customerName.trim(),
              phone: dto.customerPhone.trim(),
            }
          : undefined,
      },
      updateRequest: context.updateRequest,
    };

    if (customerDto.activationCodeId) {
      return this.createWarrantyActivationRequestUseCase.execute(
        customerDto,
        createContext,
      );
    }

    if (customerDto.items?.length) {
      return this.createWarrantyActivationRequestUseCase.execute(
        customerDto,
        createContext,
      );
    }

    if (!customerDto.productId) {
      throw new BadRequestError(
        'Either items or productId is required',
        'ACTIVATION_TARGET_REQUIRED',
      );
    }

    const product =
      await this.productsRepository.findActivationRequestTargetById(
        customerDto.productId,
      );

    if (!product) {
      throw new NotFoundError('Product not found', 'NOT_FOUND', {
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    const catalogue = getProductCatalogue(product);
    if (product.category_ref?.activation_code_enabled === false) {
      return this.createWarrantyActivationRequestUseCase.execute(
        {
          ...customerDto,
          brand: customerDto.brand ?? catalogue.brand ?? undefined,
          manufactureYear:
            customerDto.manufactureYear ?? catalogue.modelYear ?? undefined,
          model: customerDto.model ?? catalogue.model ?? undefined,
          productName:
            customerDto.productName ?? getProductDisplayName(product),
        },
        createContext,
      );
    }

    if (!product.warranty) {
      throw new NotFoundError('Product warranty not found', 'NOT_FOUND', {
        code: 'PRODUCT_WARRANTY_NOT_FOUND',
      });
    }
    if (
      product.status !== product_status.ACTIVE ||
      product.warranty.status !== warranty_status.DRAFT
    ) {
      throw new BadRequestError(
        'Product is not eligible for an activation request',
        'BAD_REQUEST',
        { code: 'PRODUCT_NOT_ELIGIBLE_FOR_ACTIVATION_REQUEST' },
      );
    }

    const warrantyCode =
      product.warranty.warranty_code ??
      (await this.generateWarrantyCodeUseCase.execute());

    if (product.warranty.warranty_code !== warrantyCode) {
      await this.productsRepository.synchronizeWarrantyCode({
        warrantyCode,
        warrantyId: product.warranty.id,
      });
    }

    return this.createWarrantyActivationRequestUseCase.execute(
      {
        ...customerDto,
        brand: customerDto.brand ?? catalogue.brand ?? undefined,
        manufactureYear:
          customerDto.manufactureYear ?? catalogue.modelYear ?? undefined,
        model: customerDto.model ?? catalogue.model ?? undefined,
        productName: customerDto.productName ?? getProductDisplayName(product),
        warrantyCode,
      },
      createContext,
    );
  }
}
