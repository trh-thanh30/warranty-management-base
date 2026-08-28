import { BadRequestError, NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestNotificationService } from '@/modules/warranty-activation-requests/service/warranty-activation-request-notification.service';
import {
  ActivationRequestItemsValidatorService,
  ValidatedActivationRequestItem,
} from '@/modules/warranty-activation-requests/service/activation-request-items-validator.service';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import {
  buildWarrantyActivationRequestFullAddress,
  normalizeText,
  optionalTrim,
} from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import {
  CreateWarrantyActivationRequestCommand,
  WARRANTY_ACTIVATION_REQUEST_SOURCE,
  WarrantyActivationRequestSource,
} from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import {
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';
import { Injectable, Optional } from '@nestjs/common';
import { normalizePhoneNumber } from '@repo/shared/utils';

const REQUEST_CODE_GENERATION_ATTEMPTS = 3;
const ACTIVATABLE_WARRANTY_STATUSES = new Set(['DRAFT']);

type ActivationRequestProduct = NonNullable<
  Awaited<ReturnType<ProductsRepository['findActivationRequestTargetById']>>
>;

type ActivationRequestDealer = {
  address: string;
  district: string | null;
  id: string;
  name: string;
  phone: string | null;
  province: string;
  sales_name: string | null;
};

@Injectable()
export class CreateWarrantyActivationRequestUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly generateWarrantyActivationRequestCodeUseCase: GenerateWarrantyActivationRequestCodeUseCase,
    private readonly productsRepository: ProductsRepository,
    private readonly dealersRepository: DealersRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly warrantyActivationRequestNotificationService: WarrantyActivationRequestNotificationService,
    @Optional()
    private readonly activationRequestItemsValidatorService?: ActivationRequestItemsValidatorService,
  ) {}

  async execute(
    dto: CreateWarrantyActivationRequestDto,
    context: {
      createdByUserId?: string;
      customerProfile?: {
        id: string;
        birthdate?: Date;
      };
      source?: WarrantyActivationRequestSource;
    } = {},
  ) {
    const dtoWarrantyCode = dto.warrantyCode?.trim().toUpperCase();
    const customerPhone = dto.customerPhone.trim();
    const customerEmail = dto.customerEmail?.trim().toLowerCase() || null;
    const customerName = dto.customerName.trim();
    const validatedItems = await this.resolveValidatedItems(dto);
    const product = validatedItems
      ? await this.productsRepository.findActivationRequestTargetById(
          validatedItems[0].productId,
        )
      : await this.resolveActivationProduct(dto, dtoWarrantyCode);

    if (!product?.warranty) {
      throw new NotFoundError('Warranty code not found', 'NOT_FOUND', {
        code: 'WARRANTY_CODE_NOT_FOUND',
        warrantyCode: dtoWarrantyCode,
      });
    }

    const warrantyCode =
      product.warranty.warranty_code ??
      (await this.generateWarrantyCodeUseCase.execute());
    const requestItems = validatedItems ?? [
      this.toPrimaryRequestItem(product, warrantyCode),
    ];

    if (product.warranty.warranty_code !== warrantyCode) {
      await this.productsRepository.synchronizeWarrantyCode({
        warrantyCode,
        warrantyId: product.warranty.id,
      });
    }

    if (!ACTIVATABLE_WARRANTY_STATUSES.has(product.warranty.status)) {
      throw new BadRequestError(
        'Warranty code is not eligible for activation request',
        'BAD_REQUEST',
        {
          code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
          currentStatus: product.warranty.status,
          expectedStatuses: Array.from(ACTIVATABLE_WARRANTY_STATUSES),
          warrantyCode,
        },
      );
    }

    this.assertProductMatchesCategory(dto.categoryId, product);

    const openRequest =
      await this.warrantyActivationRequestsRepository.findOpenByProductId(
        product.id,
      );

    if (openRequest) {
      this.throwAlreadyOpenRequest(product.id, openRequest);
    }

    for (const item of requestItems) {
      if (item.currentOwner) {
        this.assertCustomerMatchesCurrentOwner({
          customerEmail,
          customerName,
          customerPhone,
          currentOwner: item.currentOwner,
        });
      }
    }

    const dealer = await this.resolveDealer(dto);

    for (
      let attempt = 0;
      attempt < REQUEST_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const requestCode =
        await this.generateWarrantyActivationRequestCodeUseCase.execute();

      try {
        const request = await this.createRequest(
          {
            requestCode,
            source:
              context.source ?? WARRANTY_ACTIVATION_REQUEST_SOURCE.PUBLIC_WEB,
            warrantyCode,
            createdByUserId: context.createdByUserId,
            customerName,
            customerPhone,
            customerEmail,
            customerBirthdate: dto.customerBirthdate
              ? new Date(dto.customerBirthdate)
              : undefined,
            categoryId: this.resolveCategoryId(dto.categoryId, product),
            productId: product.id,
            dealerId: dealer?.id,
            vehiclePlate: optionalTrim(dto.vehiclePlate),
            vehicleModel: optionalTrim(dto.vehicleModel),
            installedAt: dto.installedAt
              ? new Date(dto.installedAt)
              : undefined,
            warrantyDurationMonths:
              validatedItems?.[0].warrantyDurationMonths ??
              dto.warrantyDurationMonths ??
              product.warranty.duration_months,
            provinceCode: dto.provinceCode.trim(),
            provinceName: dto.provinceName.trim(),
            wardCode: dto.wardCode.trim(),
            wardName: dto.wardName.trim(),
            addressDetail: dto.addressDetail.trim(),
            fullAddress: buildWarrantyActivationRequestFullAddress(dto),
            productName:
              validatedItems?.[0].productName ??
              optionalTrim(dto.productName) ??
              product.display_name ??
              product.template.name,
            serialNumber:
              validatedItems !== null
                ? validatedItems[0].serialNumber
                : (optionalTrim(dto.serialNumber) ?? product.serial_number),
            brand:
              validatedItems !== null
                ? validatedItems[0].brand
                : (optionalTrim(dto.brand) ?? product.template.brand),
            model:
              validatedItems !== null
                ? validatedItems[0].model
                : (optionalTrim(dto.model) ?? product.template.model),
            manufactureYear:
              validatedItems !== null
                ? validatedItems[0].manufactureYear
                : (dto.manufactureYear ?? product.template.model_year),
            note: optionalTrim(dto.note),
            metadata: this.buildActivationMetadata({
              dealer,
              dto,
              product,
              source:
                context.source ?? WARRANTY_ACTIVATION_REQUEST_SOURCE.PUBLIC_WEB,
              warrantyId: product.warranty.id,
            }),
            items: requestItems,
          },
          context.customerProfile,
        );

        await this.warrantyActivationRequestNotificationService.requestCreated(
          request,
        );

        return toWarrantyActivationRequestResponse(request);
      } catch (error) {
        if (
          attempt < REQUEST_CODE_GENERATION_ATTEMPTS - 1 &&
          error instanceof WarrantyActivationRequestCodeConflictError
        ) {
          continue;
        }

        if (error instanceof WarrantyActivationRequestUniqueConflictError) {
          if (validatedItems) {
            const concurrentOpenRequests =
              await this.warrantyActivationRequestsRepository.findOpenByProductIds(
                validatedItems.map((item) => item.productId),
              );
            const conflictingRequest = concurrentOpenRequests[0];
            if (conflictingRequest) {
              const conflictingProductId =
                conflictingRequest.items[0]?.product_id ??
                conflictingRequest.product_id ??
                product.id;
              this.throwAlreadyOpenRequest(
                conflictingProductId,
                conflictingRequest,
              );
            }
          }

          const concurrentOpenRequest =
            await this.warrantyActivationRequestsRepository.findOpenByProductId(
              product.id,
            );

          if (concurrentOpenRequest) {
            this.throwAlreadyOpenRequest(product.id, concurrentOpenRequest);
          }
        }

        throw error;
      }
    }

    throw new BadRequestError(
      'Could not create warranty activation request',
      'BAD_REQUEST',
      { code: 'ACTIVATION_REQUEST_CREATE_FAILED' },
    );
  }

  private createRequest(
    data: CreateWarrantyActivationRequestCommand,
    customerProfile?: {
      id: string;
      birthdate?: Date;
    },
  ) {
    if (!customerProfile) {
      return this.warrantyActivationRequestsRepository.create(data);
    }

    return this.warrantyActivationRequestsRepository.create(data, {
      customerProfile,
    });
  }

  private throwAlreadyOpenRequest(
    productId: string,
    openRequest: {
      request_code: string;
      status: string;
    },
  ): never {
    throw new BadRequestError(
      'Product already has an open warranty activation request',
      'BAD_REQUEST',
      {
        code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
        currentStatus: openRequest.status,
        productId,
        requestCode: openRequest.request_code,
      },
    );
  }

  private async resolveActivationProduct(
    dto: CreateWarrantyActivationRequestDto,
    warrantyCode: string | undefined,
  ) {
    if (dto.productId) {
      return this.productsRepository.findActivationRequestTargetById(
        dto.productId,
      );
    }

    if (warrantyCode) {
      return this.productsRepository.findActivationRequestTargetByWarrantyCode(
        warrantyCode,
      );
    }

    throw new BadRequestError(
      'Either productId or warrantyCode is required',
      'BAD_REQUEST',
      { code: 'ACTIVATION_TARGET_REQUIRED' },
    );
  }

  private async resolveValidatedItems(dto: CreateWarrantyActivationRequestDto) {
    if (!dto.items?.length) return null;
    if (!dto.categoryId) {
      throw new BadRequestError(
        'Category is required for multi-product activation requests',
        'ACTIVATION_CATEGORY_REQUIRED',
      );
    }
    if (!this.activationRequestItemsValidatorService) {
      throw new BadRequestError(
        'Activation request item validation is unavailable',
        'ACTIVATION_ITEM_VALIDATOR_UNAVAILABLE',
      );
    }

    return this.activationRequestItemsValidatorService.validate(
      dto.categoryId,
      dto.items,
    );
  }

  private toPrimaryRequestItem(
    product: ActivationRequestProduct,
    warrantyCode: string,
  ): ValidatedActivationRequestItem {
    if (!product.warranty) {
      throw new NotFoundError('Product warranty not found');
    }

    return {
      activationFieldId: null,
      positionKey: 'primaryProduct',
      positionLabel: 'Sản phẩm chính',
      productId: product.id,
      productName:
        product.display_name ?? product.template.name ?? product.product_code,
      productCode: product.product_code,
      serialNumber: product.serial_number,
      warrantyId: product.warranty.id,
      warrantyCode,
      warrantyDurationMonths: product.warranty.duration_months,
      brand: product.template.brand,
      model: product.template.model,
      manufactureYear: product.template.model_year,
      currentOwner: product.ownerships[0]?.customer ?? null,
    };
  }

  private async resolveDealer(dto: CreateWarrantyActivationRequestDto) {
    if (!dto.dealerId) {
      return this.createQuickDealer(dto);
    }

    const dealer = await this.dealersRepository.findActiveById(dto.dealerId);
    if (!dealer) {
      throw new NotFoundError('Active dealer not found', 'NOT_FOUND', {
        code: 'DEALER_NOT_FOUND',
      });
    }

    return dealer;
  }

  private async createQuickDealer(dto: CreateWarrantyActivationRequestDto) {
    const name = optionalTrim(dto.dealerName);
    const address = optionalTrim(dto.dealerAddress);
    const province = optionalTrim(dto.dealerProvince);

    if (!name && !address && !province && !dto.dealerPhone) return null;

    if (
      !name ||
      !address ||
      !province ||
      dto.dealerLatitude === undefined ||
      dto.dealerLongitude === undefined
    ) {
      throw new BadRequestError(
        'Quick dealer requires name, address, province and coordinates',
        'BAD_REQUEST',
        { code: 'QUICK_DEALER_REQUIRED_FIELDS' },
      );
    }

    const phone = optionalTrim(dto.dealerPhone);
    if (phone) {
      const existingDealer = await this.dealersRepository.findByPhone(phone);
      if (existingDealer) {
        if (existingDealer.is_active) return existingDealer;

        throw new BadRequestError(
          'Dealer phone already belongs to an inactive dealer',
          'BAD_REQUEST',
          { code: 'DEALER_PHONE_INACTIVE' },
        );
      }
    }

    return this.dealersRepository.create({
      address,
      district: optionalTrim(dto.dealerDistrict),
      is_active: true,
      name,
      phone,
      province,
      latitude: dto.dealerLatitude,
      longitude: dto.dealerLongitude,
      sales_name: optionalTrim(dto.salesName),
      metadata: {
        createdFrom: 'warrantyActivationRequest',
      },
    });
  }

  private resolveCategoryId(
    categoryId: string | undefined,
    product: ActivationRequestProduct,
  ) {
    return categoryId ?? product.category_id ?? undefined;
  }

  private assertProductMatchesCategory(
    categoryId: string | undefined,
    product: ActivationRequestProduct,
  ) {
    if (!categoryId) return;

    if (product.category_id !== categoryId) {
      throw new BadRequestError(
        'Product does not belong to the selected category',
        'BAD_REQUEST',
        {
          code: 'PRODUCT_CATEGORY_MISMATCH',
          categoryId,
          productCategoryId: product.category_id,
        },
      );
    }
  }

  private buildActivationMetadata(input: {
    dealer: ActivationRequestDealer | null;
    dto: CreateWarrantyActivationRequestDto;
    product: ActivationRequestProduct;
    source: WarrantyActivationRequestSource;
    warrantyId: string;
  }): Record<string, unknown> {
    const metadata = {
      ...(input.dto.metadata ?? {}),
    };

    metadata.productId = input.product.id;
    metadata.source = input.source;
    metadata.warrantyId = input.warrantyId;

    const dealerSnapshot = this.buildDealerSnapshot(input.dto, input.dealer);
    if (dealerSnapshot) {
      metadata.dealer = dealerSnapshot;
    }

    const filmItems = this.buildFilmItems(input.dto);
    if (filmItems) {
      metadata.filmItems = filmItems;
    }

    return metadata;
  }

  private buildDealerSnapshot(
    dto: CreateWarrantyActivationRequestDto,
    dealer: ActivationRequestDealer | null,
  ) {
    const snapshot = {
      address: dealer?.address ?? optionalTrim(dto.dealerAddress),
      id: dealer?.id ?? dto.dealerId,
      name: dealer?.name ?? optionalTrim(dto.dealerName),
      phone: dealer?.phone ?? optionalTrim(dto.dealerPhone),
      province: dealer?.province ?? optionalTrim(dto.dealerProvince),
      district: dealer?.district ?? optionalTrim(dto.dealerDistrict),
      salesName: dealer?.sales_name ?? optionalTrim(dto.salesName),
    };
    const compact = Object.fromEntries(
      Object.entries(snapshot).filter(([, value]) => Boolean(value)),
    );

    return Object.keys(compact).length > 0 ? compact : null;
  }

  private buildFilmItems(dto: CreateWarrantyActivationRequestDto) {
    if (!dto.filmItems) return null;

    const compact = Object.fromEntries(
      Object.entries(dto.filmItems)
        .map(([key, value]) => [key, optionalTrim(value)])
        .filter(([, value]) => Boolean(value)),
    );

    return Object.keys(compact).length > 0 ? compact : null;
  }

  private assertCustomerMatchesCurrentOwner(input: {
    currentOwner: {
      email: string | null;
      full_name: string;
      phone: string | null;
    };
    customerEmail: string | null;
    customerName: string;
    customerPhone: string;
  }) {
    const expectedPhone = normalizePhoneNumber(input.currentOwner.phone);
    const expectedEmail = normalizeText(input.currentOwner.email);
    const expectedName = normalizeText(input.currentOwner.full_name);
    const phoneMatches =
      !expectedPhone ||
      expectedPhone === normalizePhoneNumber(input.customerPhone);
    const emailMatches =
      !expectedEmail ||
      !input.customerEmail ||
      expectedEmail === normalizeText(input.customerEmail);
    const nameMatches = expectedName === normalizeText(input.customerName);

    if (!phoneMatches || !emailMatches || !nameMatches) {
      throw new BadRequestError(
        'Customer information does not match warranty owner',
        'BAD_REQUEST',
        { code: 'CUSTOMER_OWNER_MISMATCH' },
      );
    }
  }
}
