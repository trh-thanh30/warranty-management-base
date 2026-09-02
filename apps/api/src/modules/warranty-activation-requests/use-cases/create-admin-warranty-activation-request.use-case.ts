import { BadRequestError, NotFoundError } from '@/common/response';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import {
  getProductCatalogue,
  getProductDisplayName,
} from '@/modules/products/product-catalogue';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { Injectable } from '@nestjs/common';
import {
  product_status,
  warranty_activation_request_source,
  warranty_status,
} from '@prisma/client';

@Injectable()
export class CreateAdminWarrantyActivationRequestUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async execute(
    dto: CreateAdminWarrantyActivationRequestDto,
    context: { createdByUserId?: string } = {},
  ) {
    const customer = await this.customersRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found', 'NOT_FOUND', {
        code: 'CUSTOMER_NOT_FOUND',
        customerId: dto.customerId,
      });
    }

    const submittedBirthdate = dto.customerBirthdate
      ? new Date(dto.customerBirthdate)
      : undefined;
    const effectiveBirthdate = submittedBirthdate ?? customer.birthdate;
    const customerDto = {
      ...dto,
      customerBirthdate: effectiveBirthdate
        ? effectiveBirthdate.toISOString().slice(0, 10)
        : undefined,
      customerEmail: customer.email ?? undefined,
      customerName: customer.full_name,
      customerPhone: customer.phone ?? dto.customerPhone,
    };
    const createContext = {
      createdByUserId: context.createdByUserId,
      source: warranty_activation_request_source.ADMIN_PORTAL,
      customerProfile: {
        id: customer.id,
        birthdate: submittedBirthdate,
      },
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

    if (!product?.warranty) {
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

    const catalogue = getProductCatalogue(product);
    return this.createWarrantyActivationRequestUseCase.execute(
      {
        ...customerDto,
        brand: customerDto.brand ?? catalogue.brand ?? undefined,
        manufactureYear:
          customerDto.manufactureYear ?? catalogue.modelYear ?? undefined,
        model: customerDto.model ?? catalogue.model ?? undefined,
        productName: customerDto.productName ?? getProductDisplayName(product),
        serialNumber:
          customerDto.serialNumber ?? product.serial_number ?? undefined,
        warrantyCode,
      },
      createContext,
    );
  }
}
