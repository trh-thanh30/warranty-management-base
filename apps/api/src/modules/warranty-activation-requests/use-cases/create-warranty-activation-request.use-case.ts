import { BadRequestError, NotFoundError } from '@/common/response';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
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
  ) {}

  async execute(
    dto: CreateWarrantyActivationRequestDto,
    context: {
      createdByUserId?: string;
      source?: warranty_activation_request_source;
    } = {},
  ) {
    const warrantyCode = dto.warrantyCode.trim().toUpperCase();
    const customerPhone = dto.customerPhone.trim();
    const customerEmail = dto.customerEmail.trim().toLowerCase();
    const customerName = dto.customerName.trim();
    const product =
      await this.productsRepository.findActivationRequestTargetByWarrantyCode(
        warrantyCode,
      );

    if (!product?.warranty) {
      throw new NotFoundError('Warranty code not found', 'NOT_FOUND', {
        code: 'WARRANTY_CODE_NOT_FOUND',
        warrantyCode,
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
          province_code: dto.provinceCode.trim(),
          province_name: dto.provinceName.trim(),
          ward_code: dto.wardCode.trim(),
          ward_name: dto.wardName.trim(),
          address_detail: dto.addressDetail.trim(),
          full_address: buildWarrantyActivationRequestFullAddress(dto),
          product_name: optionalTrim(dto.productName) ?? product.name,
          serial_number:
            optionalTrim(dto.serialNumber) ?? product.serial_number,
          brand: optionalTrim(dto.brand) ?? product.brand,
          model: optionalTrim(dto.model) ?? product.model,
          manufacture_year: dto.manufactureYear ?? product.manufacture_year,
          note: optionalTrim(dto.note),
          metadata: {
            productId: product.id,
            source:
              context.source ?? warranty_activation_request_source.PUBLIC_WEB,
            warrantyId: product.warranty.id,
          },
        });

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

  private assertCustomerMatchesCurrentOwner(input: {
    currentOwner: {
      email: string | null;
      full_name: string;
      phone: string | null;
    };
    customerEmail: string;
    customerName: string;
    customerPhone: string;
  }) {
    const expectedPhone = normalizePhone(input.currentOwner.phone);
    const expectedEmail = normalizeText(input.currentOwner.email);
    const expectedName = normalizeText(input.currentOwner.full_name);
    const phoneMatches =
      !expectedPhone || expectedPhone === normalizePhone(input.customerPhone);
    const emailMatches =
      !expectedEmail || expectedEmail === normalizeText(input.customerEmail);
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
