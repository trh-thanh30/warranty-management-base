import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import {
  getProductCatalogue,
  getProductDisplayName,
} from '@/modules/products/product-catalogue';
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
  optionalTrim,
} from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import {
  CreateWarrantyActivationRequestCommand,
  CreateWarrantyActivationRequestOptions,
  WARRANTY_ACTIVATION_REQUEST_SOURCE,
  WarrantyActivationRequestSource,
  UpdateWarrantyActivationRequestContext,
} from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import {
  WarrantyActivationCodeReservationConflictError,
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
  WarrantyActivationRequestWarrantyCodeConflictError,
  WarrantyActivationRequestUpdateConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';
import { Injectable, Optional } from '@nestjs/common';
import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { activation_code_status } from '@prisma/client';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

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
    @Optional()
    private readonly generateDealerCodeUseCase: GenerateDealerCodeUseCase = new GenerateDealerCodeUseCase(),
    @Optional()
    private readonly activationCodeRepository?: ActivationCodeBatchesRepository,
    @Optional()
    private readonly activationCodeCrypto?: ActivationCodeCryptoService,
    @Optional()
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    dto: CreateWarrantyActivationRequestDto,
    context: {
      createdByUserId?: string;
      customerProfile?: CreateWarrantyActivationRequestOptions['customerProfile'];
      source?: WarrantyActivationRequestSource;
      actor?: DealerAccessActor;
      updateRequest?: UpdateWarrantyActivationRequestContext;
    } = {},
  ) {
    const activationCode = dto.activationCode?.trim().toUpperCase();
    if (
      dto.activationCodeId &&
      context.source !== WARRANTY_ACTIVATION_REQUEST_SOURCE.ADMIN_PORTAL
    ) {
      throw new BadRequestError(
        'Activation code ID is only available for admin requests',
        'ACTIVATION_CODE_ID_NOT_ALLOWED',
      );
    }
    const activationCodeRecord = dto.activationCodeId
      ? await this.resolveActivationCodeById(
          dto.activationCodeId,
          context.updateRequest?.id,
        )
      : activationCode
        ? await this.resolveActivationCode(activationCode)
        : null;
    if (activationCodeRecord && !activationCodeRecord.product_id) {
      throw new BadRequestError(
        'Activation code has not been assigned to a product',
        'ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED',
      );
    }
    const dtoWarrantyCode = dto.warrantyCode?.trim().toUpperCase();
    const customerPhone = dto.customerPhone.trim();
    const customerEmail = dto.customerEmail?.trim().toLowerCase() || null;
    const customerName = dto.customerName.trim();
    const validatedItems = await this.resolveValidatedItems(
      dto,
      context.updateRequest?.id,
    );
    const product = validatedItems
      ? await this.productsRepository.findActivationRequestTargetById(
          validatedItems[0].productId,
        )
      : activationCodeRecord
        ? await this.productsRepository.findActivationRequestTargetById(
            activationCodeRecord.product_id ?? '',
          )
        : await this.resolveActivationProduct(dto, dtoWarrantyCode);

    const hasGenericCode = Boolean(
      validatedItems?.some((item) => item.activationCodeId) ||
      activationCodeRecord,
    );
    if (!product) {
      throw new NotFoundError('Warranty code not found', 'NOT_FOUND', {
        code: 'WARRANTY_CODE_NOT_FOUND',
        warrantyCode: dtoWarrantyCode,
      });
    }
    const isCodeLessProduct =
      product.category_ref?.activation_code_enabled === false;
    if (
      !product.warranty &&
      !hasGenericCode &&
      !validatedItems?.length &&
      !isCodeLessProduct
    ) {
      throw new NotFoundError('Warranty code not found', 'NOT_FOUND', {
        code: 'WARRANTY_CODE_NOT_FOUND',
        warrantyCode: dtoWarrantyCode,
      });
    }
    const createsIndependentWarranty = hasGenericCode || isCodeLessProduct;
    if (
      hasGenericCode &&
      product.category_ref?.activation_code_enabled === false
    ) {
      throw new BadRequestError(
        'Activation codes are not applicable to this product category',
        'ACTIVATION_CODE_NOT_APPLICABLE',
      );
    }

    if (activationCodeRecord && dto.productId && dto.productId !== product.id) {
      throw new BadRequestError(
        'Activation code does not belong to the selected product',
        'BAD_REQUEST',
        { code: 'ACTIVATION_CODE_PRODUCT_MISMATCH' },
      );
    }

    // A code (or code-less installation) identifies a new physical item. Its
    // warranty must be created independently, even when this catalogue
    // product already has an active/current warranty.
    const existingWarrantyCode = createsIndependentWarranty
      ? undefined
      : (product.warranty?.warranty_code ?? dtoWarrantyCode);
    const reservedWarrantyCodes = new Set<string>();
    let requestItems = validatedItems
      ? await Promise.all(
          validatedItems.map(async (item) => {
            const itemWarrantyCode =
              this.findPreservedWarrantyCode(item, context.updateRequest) ??
              item.warrantyCode ??
              (!item.warrantyId || isCodeLessProduct
                ? await this.generateDistinctWarrantyCode(reservedWarrantyCodes)
                : existingWarrantyCode);
            if (itemWarrantyCode) reservedWarrantyCodes.add(itemWarrantyCode);
            return { ...item, warrantyCode: itemWarrantyCode ?? null };
          }),
        )
      : [];
    let warrantyCode =
      requestItems[0]?.warrantyCode ??
      (createsIndependentWarranty
        ? (context.updateRequest?.warrantyCode ??
          (await this.generateDistinctWarrantyCode(reservedWarrantyCodes)))
        : (existingWarrantyCode ??
          `PENDING-${activationCodeRecord?.id ?? Date.now()}`));
    if (!validatedItems) {
      requestItems.push({
        ...this.toPrimaryRequestItem(
          product,
          warrantyCode,
          createsIndependentWarranty,
        ),
        activationCodeId: activationCodeRecord?.id ?? null,
      });
    }

    if (
      !createsIndependentWarranty &&
      product.warranty &&
      product.warranty.warranty_code !== warrantyCode
    ) {
      await this.productsRepository.synchronizeWarrantyCode({
        warrantyCode,
        warrantyId: product.warranty.id,
      });
    }

    if (
      !createsIndependentWarranty &&
      product.warranty &&
      !ACTIVATABLE_WARRANTY_STATUSES.has(product.warranty.status)
    ) {
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

    const openRequest = context.updateRequest
      ? await this.warrantyActivationRequestsRepository.findOpenByProductId(
          product.id,
          context.updateRequest.id,
        )
      : await this.warrantyActivationRequestsRepository.findOpenByProductId(
          product.id,
        );

    if (openRequest && !createsIndependentWarranty) {
      this.throwAlreadyOpenRequest(product.id, openRequest);
    }

    if (context.actor) {
      if (!this.dealerAccessPolicy) {
        throw new Error(
          'Dealer access policy is required for authenticated requests',
        );
      }
      await this.dealerAccessPolicy.assertCanAccessRecord(
        context.actor,
        dto.dealerId,
      );
    }
    const dealer = await this.resolveDealer(dto);

    for (
      let attempt = 0;
      attempt < REQUEST_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const requestCode =
        context.updateRequest?.requestCode ??
        (await this.generateWarrantyActivationRequestCodeUseCase.execute());

      try {
        const catalogue = getProductCatalogue(product);
        const request = await this.createRequest(
          {
            requestCode,
            source:
              context.source ?? WARRANTY_ACTIVATION_REQUEST_SOURCE.PUBLIC_WEB,
            warrantyCode,
            activationCodeId: activationCodeRecord?.id,
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
              product.warranty?.duration_months ??
              product.warranty_duration_months ??
              0,
            provinceCode: dto.provinceCode.trim(),
            provinceName: dto.provinceName.trim(),
            wardCode: dto.wardCode.trim(),
            wardName: dto.wardName.trim(),
            addressDetail: dto.addressDetail.trim(),
            fullAddress: buildWarrantyActivationRequestFullAddress(dto),
            productName:
              validatedItems?.[0].productName ??
              optionalTrim(dto.productName) ??
              getProductDisplayName(product),
            serialNumber:
              validatedItems !== null
                ? validatedItems[0].serialNumber
                : (product.warranty?.serial_number ?? null),
            brand:
              validatedItems !== null
                ? validatedItems[0].brand
                : (optionalTrim(dto.brand) ?? catalogue.brand),
            model:
              validatedItems !== null
                ? validatedItems[0].model
                : (optionalTrim(dto.model) ?? catalogue.model),
            manufactureYear:
              validatedItems !== null
                ? validatedItems[0].manufactureYear
                : (dto.manufactureYear ?? catalogue.modelYear),
            note: optionalTrim(dto.note),
            metadata: this.buildActivationMetadata({
              dealer,
              dto,
              product,
              source:
                context.source ?? WARRANTY_ACTIVATION_REQUEST_SOURCE.PUBLIC_WEB,
              warrantyId: createsIndependentWarranty
                ? ''
                : (product.warranty?.id ?? ''),
            }),
            items: requestItems,
          },
          context.customerProfile,
          context.updateRequest?.id,
        );

        if (!context.updateRequest) {
          await this.warrantyActivationRequestNotificationService.requestCreated(
            request,
          );
        }

        return toWarrantyActivationRequestResponse(request);
      } catch (error) {
        if (error instanceof WarrantyActivationCodeReservationConflictError) {
          throw new ConflictError(
            'Activation code already has an open activation request',
            'ACTIVATION_REQUEST_ALREADY_OPEN',
            {
              activationCodeIds: error.activationCodeIds,
            },
          );
        }

        if (error instanceof WarrantyActivationRequestUpdateConflictError) {
          throw new BadRequestError(
            'Only pending warranty activation requests can be updated',
            'ACTIVATION_REQUEST_NOT_PENDING',
          );
        }

        if (
          attempt < REQUEST_CODE_GENERATION_ATTEMPTS - 1 &&
          error instanceof WarrantyActivationRequestWarrantyCodeConflictError
        ) {
          const retriedCodes = new Set<string>();
          requestItems = await Promise.all(
            requestItems.map(async (item) => ({
              ...item,
              warrantyCode:
                item.activationCodeId && !item.warrantyId
                  ? await this.generateDistinctWarrantyCode(retriedCodes)
                  : item.warrantyCode,
            })),
          );
          warrantyCode = requestItems[0]?.warrantyCode ?? warrantyCode;
          continue;
        }

        if (
          attempt < REQUEST_CODE_GENERATION_ATTEMPTS - 1 &&
          error instanceof WarrantyActivationRequestCodeConflictError
        ) {
          continue;
        }

        if (
          !createsIndependentWarranty &&
          error instanceof WarrantyActivationRequestUniqueConflictError
        ) {
          if (validatedItems) {
            const concurrentOpenRequests = context.updateRequest
              ? await this.warrantyActivationRequestsRepository.findOpenByProductIds(
                  validatedItems.map((item) => item.productId),
                  context.updateRequest.id,
                )
              : await this.warrantyActivationRequestsRepository.findOpenByProductIds(
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

          const concurrentOpenRequest = context.updateRequest
            ? await this.warrantyActivationRequestsRepository.findOpenByProductId(
                product.id,
                context.updateRequest.id,
              )
            : await this.warrantyActivationRequestsRepository.findOpenByProductId(
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

  private async generateDistinctWarrantyCode(reserved: Set<string>) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = await this.generateWarrantyCodeUseCase.execute();
      if (!reserved.has(code)) {
        reserved.add(code);
        return code;
      }
    }

    throw new BadRequestError(
      'Could not reserve a unique warranty code for every activation item',
      'WARRANTY_CODE_GENERATION_FAILED',
    );
  }

  private findPreservedWarrantyCode(
    item: ValidatedActivationRequestItem,
    updateRequest?: UpdateWarrantyActivationRequestContext,
  ) {
    if (!updateRequest) return undefined;

    return updateRequest.items.find((currentItem) =>
      item.activationCodeId
        ? currentItem.activationCodeId === item.activationCodeId
        : currentItem.positionKey === item.positionKey &&
          currentItem.productId === item.productId,
    )?.warrantyCode;
  }

  private async resolveActivationCode(code: string) {
    if (!this.activationCodeRepository || !this.activationCodeCrypto) {
      throw new BadRequestError(
        'Activation code support is unavailable',
        'BAD_REQUEST',
        { code: 'ACTIVATION_CODE_UNAVAILABLE' },
      );
    }
    const record = await this.activationCodeRepository.findByHash(
      this.activationCodeCrypto.hash(code),
    );
    if (record?.status === activation_code_status.PENDING_APPROVAL) {
      this.throwActivationCodeAlreadyPending(record.id);
    }
    if (!record) {
      throw new BadRequestError(
        'Activation code is invalid or expired',
        'BAD_REQUEST',
        { code: 'ACTIVATION_CODE_INVALID_OR_EXPIRED' },
      );
    }
    if (
      record.status !== activation_code_status.AVAILABLE ||
      record.expires_at <= new Date()
    ) {
      await this.activationCodeRepository.expireIfNeeded(record.id);
      throw new BadRequestError(
        'Activation code is invalid or expired',
        'BAD_REQUEST',
        { code: 'ACTIVATION_CODE_INVALID_OR_EXPIRED' },
      );
    }
    return record;
  }

  private async resolveActivationCodeById(
    id: string,
    updateRequestId?: string,
  ) {
    if (!this.activationCodeRepository) {
      throw new BadRequestError(
        'Activation code support is unavailable',
        'BAD_REQUEST',
      );
    }
    const record = updateRequestId
      ? await this.activationCodeRepository.findSelectableForPendingRequest(
          id,
          updateRequestId,
        )
      : await this.activationCodeRepository.findById(id);
    if (
      record?.status === activation_code_status.PENDING_APPROVAL &&
      !updateRequestId
    ) {
      this.throwActivationCodeAlreadyPending(record.id);
    }
    if (
      !record ||
      (record.status !== activation_code_status.AVAILABLE &&
        record.status !== activation_code_status.PENDING_APPROVAL) ||
      record.expires_at <= new Date()
    ) {
      if (record?.status === activation_code_status.AVAILABLE) {
        await this.activationCodeRepository.expireIfNeeded(record.id);
      }
      throw new BadRequestError(
        'Activation code is invalid or expired',
        'BAD_REQUEST',
        { code: 'ACTIVATION_CODE_INVALID_OR_EXPIRED' },
      );
    }
    return record;
  }

  private throwActivationCodeAlreadyPending(activationCodeId: string): never {
    throw new ConflictError(
      'Activation code already has an open activation request',
      'ACTIVATION_REQUEST_ALREADY_OPEN',
      {
        activationCodeIds: [activationCodeId],
      },
    );
  }

  private createRequest(
    data: CreateWarrantyActivationRequestCommand,
    customerProfile?: CreateWarrantyActivationRequestOptions['customerProfile'],
    updateRequestId?: string,
  ) {
    if (updateRequestId) {
      return this.warrantyActivationRequestsRepository.updatePending(
        updateRequestId,
        data,
        customerProfile ? { customerProfile } : undefined,
      );
    }
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

  private async resolveValidatedItems(
    dto: CreateWarrantyActivationRequestDto,
    updateRequestId?: string,
  ) {
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

    return updateRequestId
      ? this.activationRequestItemsValidatorService.validate(
          dto.categoryId,
          dto.items,
          { updateRequestId },
        )
      : this.activationRequestItemsValidatorService.validate(
          dto.categoryId,
          dto.items,
        );
  }

  private toPrimaryRequestItem(
    product: ActivationRequestProduct,
    warrantyCode: string,
    createsIndependentWarranty: boolean,
  ): ValidatedActivationRequestItem {
    const catalogue = getProductCatalogue(product);
    return {
      activationCodeId: null,
      activationFieldId: null,
      positionKey: 'primaryProduct',
      positionLabel: 'Sản phẩm chính',
      productId: product.id,
      productName: getProductDisplayName(product),
      productCode: product.product_code,
      serialNumber: createsIndependentWarranty
        ? null
        : (product.warranty?.serial_number ?? null),
      warrantyId: createsIndependentWarranty
        ? null
        : (product.warranty?.id ?? null),
      warrantyCode: createsIndependentWarranty
        ? warrantyCode
        : (product.warranty?.warranty_code ?? warrantyCode),
      warrantyDurationMonths:
        product.warranty?.duration_months ??
        product.warranty_duration_months ??
        0,
      brand: catalogue.brand,
      model: catalogue.model,
      manufactureYear: catalogue.modelYear,
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
      dealer_code: this.generateDealerCodeUseCase.execute(),
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
}
