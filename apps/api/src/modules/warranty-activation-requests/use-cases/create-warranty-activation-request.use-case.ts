import { BadRequestError, NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestNotificationService } from '@/modules/warranty-activation-requests/service/warranty-activation-request-notification.service';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import {
  buildWarrantyActivationRequestFullAddress,
  normalizePhone,
  normalizeText,
  optionalTrim,
} from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Product,
  ProductTemplate,
  Customer,
  Dealer,
  warranty_activation_request_source,
  warranty_status,
} from '@prisma/client';

const REQUEST_CODE_GENERATION_ATTEMPTS = 3;
const ACTIVATABLE_WARRANTY_STATUSES = new Set<warranty_status>([
  warranty_status.DRAFT,
]);

@Injectable()
export class CreateWarrantyActivationRequestUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly generateWarrantyActivationRequestCodeUseCase: GenerateWarrantyActivationRequestCodeUseCase,
    private readonly productsRepository: ProductsRepository,
    private readonly dealersRepository: DealersRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly warrantyActivationRequestNotificationService: WarrantyActivationRequestNotificationService,
  ) {}

  async execute(
    dto: CreateWarrantyActivationRequestDto,
    context: {
      createdByUserId?: string;
      source?: warranty_activation_request_source;
    } = {},
  ) {
    const dtoWarrantyCode = dto.warrantyCode?.trim().toUpperCase();
    const customerPhone = dto.customerPhone.trim();
    const customerEmail = dto.customerEmail?.trim().toLowerCase() || null;
    const customerName = dto.customerName.trim();
    const product = await this.resolveActivationProduct(dto, dtoWarrantyCode);

    if (!product?.warranty) {
      throw new NotFoundError('Warranty code not found', 'NOT_FOUND', {
        code: 'WARRANTY_CODE_NOT_FOUND',
        warrantyCode: dtoWarrantyCode,
      });
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

    const dealer = await this.resolveDealer(dto);

    const currentOwner = product.ownerships[0]?.customer;
    if (currentOwner) {
      this.assertCustomerMatchesCurrentOwner({
        customerEmail,
        customerName,
        customerPhone,
        currentOwner,
      });
    }

    const pendingDuplicate =
      await this.warrantyActivationRequestsRepository.findPendingDuplicate({
        warrantyCode,
        customerPhone,
      });

    if (pendingDuplicate) {
      throw new BadRequestError(
        'Warranty activation request already pending',
        'BAD_REQUEST',
        {
          code: 'ACTIVATION_REQUEST_ALREADY_PENDING',
          warrantyCode,
        },
      );
    }

    for (
      let attempt = 0;
      attempt < REQUEST_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const requestCode =
        await this.generateWarrantyActivationRequestCodeUseCase.execute();

      try {
        const request = await this.warrantyActivationRequestsRepository.create({
          request_code: requestCode,
          source:
            context.source ?? warranty_activation_request_source.PUBLIC_WEB,
          warranty_code: warrantyCode,
          created_by: context.createdByUserId
            ? { connect: { id: context.createdByUserId } }
            : undefined,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          customer_birthdate: dto.customerBirthdate
            ? new Date(dto.customerBirthdate)
            : undefined,
          category: this.resolveCategoryConnect(dto.categoryId, product),
          product: { connect: { id: product.id } },
          dealer: dealer ? { connect: { id: dealer.id } } : undefined,
          vehicle_plate: optionalTrim(dto.vehiclePlate),
          vehicle_model: optionalTrim(dto.vehicleModel),
          installed_at: dto.installedAt ? new Date(dto.installedAt) : undefined,
          warranty_duration_months:
            dto.warrantyDurationMonths ?? product.warranty.duration_months,
          province_code: dto.provinceCode.trim(),
          province_name: dto.provinceName.trim(),
          ward_code: dto.wardCode.trim(),
          ward_name: dto.wardName.trim(),
          address_detail: dto.addressDetail.trim(),
          full_address: buildWarrantyActivationRequestFullAddress(dto),
          product_name:
            optionalTrim(dto.productName) ??
            product.display_name ??
            product.template.name,
          serial_number:
            optionalTrim(dto.serialNumber) ?? product.serial_number,
          brand: optionalTrim(dto.brand) ?? product.template.brand,
          model: optionalTrim(dto.model) ?? product.template.model,
          manufacture_year: dto.manufactureYear ?? product.template.model_year,
          note: optionalTrim(dto.note),
          metadata: this.buildActivationMetadata({
            dealer,
            dto,
            product,
            source:
              context.source ?? warranty_activation_request_source.PUBLIC_WEB,
            warrantyId: product.warranty.id,
          }),
        });

        await this.warrantyActivationRequestNotificationService.requestCreated(
          request,
        );

        return toWarrantyActivationRequestResponse(request);
      } catch (error) {
        if (
          attempt < REQUEST_CODE_GENERATION_ATTEMPTS - 1 &&
          this.isRequestCodeConflict(error)
        ) {
          continue;
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

  private isRequestCodeConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('request_code')
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

    if (!name || !address || !province) {
      throw new BadRequestError(
        'Quick dealer requires name, address and province',
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
      sales_name: optionalTrim(dto.salesName),
      metadata: {
        createdFrom: 'warrantyActivationRequest',
      },
    });
  }

  private resolveCategoryConnect(
    categoryId: string | undefined,
    product: Product & { template: ProductTemplate },
  ) {
    const resolvedCategoryId = categoryId ?? product.category_id;
    return resolvedCategoryId
      ? { connect: { id: resolvedCategoryId } }
      : undefined;
  }

  private assertProductMatchesCategory(
    categoryId: string | undefined,
    product: Product & { template: ProductTemplate },
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
    dealer: Dealer | null;
    dto: CreateWarrantyActivationRequestDto;
    product: Product;
    source: warranty_activation_request_source;
    warrantyId: string;
  }): Prisma.InputJsonObject {
    const metadata = {
      ...(input.dto.metadata ?? {}),
    } as Record<string, Prisma.InputJsonValue>;

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
    dealer: Dealer | null,
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

    return Object.keys(compact).length > 0
      ? (compact as Prisma.InputJsonObject)
      : null;
  }

  private buildFilmItems(dto: CreateWarrantyActivationRequestDto) {
    if (!dto.filmItems) return null;

    const compact = Object.fromEntries(
      Object.entries(dto.filmItems)
        .map(([key, value]) => [key, optionalTrim(value)])
        .filter(([, value]) => Boolean(value)),
    );

    return Object.keys(compact).length > 0
      ? (compact as Prisma.InputJsonObject)
      : null;
  }

  private assertCustomerMatchesCurrentOwner(input: {
    currentOwner: Pick<Customer, 'email' | 'full_name' | 'phone'>;
    customerEmail: string | null;
    customerName: string;
    customerPhone: string;
  }) {
    const expectedPhone = normalizePhone(input.currentOwner.phone);
    const expectedEmail = normalizeText(input.currentOwner.email);
    const expectedName = normalizeText(input.currentOwner.full_name);
    const phoneMatches =
      !expectedPhone || expectedPhone === normalizePhone(input.customerPhone);
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
