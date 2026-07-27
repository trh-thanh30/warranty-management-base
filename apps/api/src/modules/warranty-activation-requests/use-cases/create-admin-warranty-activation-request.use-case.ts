import { BadRequestError, NotFoundError } from '@/common/response';
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
  ) {}

  async execute(
    dto: CreateAdminWarrantyActivationRequestDto,
    context: { createdByUserId?: string } = {},
  ) {
    const product =
      await this.productsRepository.findActivationRequestTargetById(
        dto.productId,
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

    return this.createWarrantyActivationRequestUseCase.execute(
      {
        ...dto,
        brand: dto.brand ?? product.template.brand ?? undefined,
        manufactureYear:
          dto.manufactureYear ?? product.template.model_year ?? undefined,
        model: dto.model ?? product.template.model ?? undefined,
        productName:
          dto.productName ?? product.display_name ?? product.template.name,
        serialNumber: dto.serialNumber ?? product.serial_number ?? undefined,
        warrantyCode,
      },
      {
        createdByUserId: context.createdByUserId,
        source: warranty_activation_request_source.ADMIN_PORTAL,
      },
    );
  }
}
