import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import {
  WarrantyActivationRequestsRepository,
  WarrantyActivationReviewTransactionRepository,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { optionalTrim } from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { Injectable, Logger } from '@nestjs/common';
import {
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

@Injectable()
export class ReviewWarrantyActivationRequestUseCase {
  private readonly logger = new Logger(
    ReviewWarrantyActivationRequestUseCase.name,
  );

  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly issueRequestCertificate: IssueWarrantyActivationRequestCertificateUseCase,
  ) {}

  async execute(
    id: string,
    dto: ReviewWarrantyActivationRequestDto,
    context: { reviewedByUserId?: string } = {},
  ) {
    const existingRequest =
      await this.warrantyActivationRequestsRepository.findById(id);

    if (!existingRequest) {
      throw new NotFoundError('Warranty activation request not found');
    }

    const canActivateApprovedRequest =
      existingRequest.status === warranty_activation_request_status.APPROVED &&
      dto.status === warranty_activation_request_status.APPROVED;

    if (
      existingRequest.status !== warranty_activation_request_status.PENDING &&
      !canActivateApprovedRequest
    ) {
      throw new BadRequestError('Warranty activation request is not pending');
    }

    if (
      dto.status === warranty_activation_request_status.REJECTED &&
      !dto.rejectionReason?.trim()
    ) {
      throw new BadRequestError('Rejection reason is required');
    }

    if (dto.status === warranty_activation_request_status.APPROVED) {
      const activatedRequest = await this.activateApprovedRequest({
        adminNote: optionalTrim(dto.adminNote),
        id,
        reviewedById: context.reviewedByUserId,
      });

      if (!activatedRequest) {
        throw new NotFoundError('Warranty activation request target not found');
      }

      try {
        await this.issueRequestCertificate.execute({
          recipientEmail: activatedRequest.customer_email ?? undefined,
          requestId: activatedRequest.id,
        });
      } catch (error) {
        this.logger.error(
          `Activation request ${activatedRequest.id} was activated but certificate issuance failed: ${String(error)}`,
        );
      }

      const refreshedRequest =
        await this.warrantyActivationRequestsRepository.findById(id);

      return toWarrantyActivationRequestResponse(
        refreshedRequest ?? activatedRequest,
      );
    }

    const request = await this.warrantyActivationRequestsRepository.review({
      id,
      adminNote: optionalTrim(dto.adminNote),
      rejectionReason:
        dto.status === warranty_activation_request_status.REJECTED
          ? dto.rejectionReason?.trim()
          : undefined,
      reviewedById: context.reviewedByUserId,
      status: dto.status,
    });

    return toWarrantyActivationRequestResponse(request);
  }

  private activateApprovedRequest(input: {
    adminNote?: string;
    id: string;
    reviewedById?: string;
  }) {
    return this.warrantyActivationRequestsRepository.withReviewTransaction(
      async (repository) => {
        const request = await repository.findRequest(input.id);
        if (!request) return null;

        if (request.activated_warranty_id) {
          throw new BadRequestError(
            'Warranty activation request already activated',
            'BAD_REQUEST',
            { code: 'ACTIVATION_REQUEST_ALREADY_ACTIVATED' },
          );
        }

        const targets = request.items.length
          ? request.items.map((item) => ({
              product: item.product,
              warrantyId: item.warranty_id,
              warrantyCode: item.warranty_code,
            }))
          : await this.resolveLegacyActivationTargets(
              repository,
              request.warranty_code,
            );
        if (targets.length === 0) return null;

        for (const target of targets) {
          if (
            target.product.status !== product_status.ACTIVE ||
            target.product.deleted_at !== null ||
            !target.product.warranty ||
            target.product.warranty.id !== target.warrantyId ||
            target.product.warranty.status !== warranty_status.DRAFT
          ) {
            throw new BadRequestError(
              'Warranty code is not eligible for activation',
              'BAD_REQUEST',
              {
                code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
                productId: target.product.id,
                warrantyCode: target.warrantyCode,
              },
            );
          }
        }

        const reviewedAt = new Date();
        const customer = await this.resolveActivationCustomer(repository, {
          address: request.full_address,
          email: request.customer_email,
          fullName: request.customer_name,
          phone: request.customer_phone,
        });
        const activatedWarrantyIds: string[] = [];

        for (const target of targets) {
          await repository.closeCurrentOwnerships(
            target.product.id,
            reviewedAt,
          );
          await repository.createOwnership({
            customerId: customer.id,
            ownerUserId: customer.user_id,
            productId: target.product.id,
            purchaseDate: reviewedAt,
          });
          const updatedWarranty = await this.activateDraftWarranty(repository, {
            activatedByUserId: input.reviewedById,
            startDate: reviewedAt,
            warrantyId: target.warrantyId,
          });
          activatedWarrantyIds.push(updatedWarranty.id);
        }

        await repository.markItemsActivated(input.id, reviewedAt);

        return repository.completeActivation({
          activatedWarrantyId: activatedWarrantyIds[0],
          adminNote: input.adminNote,
          customerId: customer.id,
          id: input.id,
          reviewedAt,
          reviewedById: input.reviewedById,
        });
      },
    );
  }

  private async resolveLegacyActivationTargets(
    repository: WarrantyActivationReviewTransactionRepository,
    warrantyCode: string,
  ) {
    const product = await repository.findLegacyProduct(warrantyCode);
    if (!product?.warranty) return [];

    return [
      {
        product,
        warrantyId: product.warranty.id,
        warrantyCode,
      },
    ];
  }

  private async resolveActivationCustomer(
    repository: WarrantyActivationReviewTransactionRepository,
    input: {
      address: string;
      email: string | null;
      fullName: string;
      phone: string;
    },
  ) {
    const [phoneCustomer, emailCustomer] = await Promise.all([
      repository.findCustomerByPhone(input.phone),
      input.email
        ? repository.findCustomerByEmail(input.email)
        : Promise.resolve(null),
    ]);
    const existingCustomer = phoneCustomer ?? emailCustomer;

    if (
      phoneCustomer &&
      emailCustomer &&
      phoneCustomer.id !== emailCustomer.id
    ) {
      throw new BadRequestError(
        'Customer email and phone belong to different customer profiles',
        'BAD_REQUEST',
        { code: 'CUSTOMER_IDENTITY_CONFLICT' },
      );
    }

    const data = {
      address: input.address,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
    };
    if (existingCustomer) {
      return repository.updateCustomer(existingCustomer.id, data);
    }

    return repository.createCustomer({
      ...data,
      customer_code: await this.generateCustomerCode(repository),
    });
  }

  private async generateCustomerCode(
    repository: WarrantyActivationReviewTransactionRepository,
  ) {
    const prefix = 'CUS';
    const padLength = 6;
    const lastCustomer = await repository.findLastCustomerCode(prefix);
    const match = lastCustomer?.customer_code.match(
      new RegExp(`^${prefix}(\\d{${padLength},})$`),
    );
    const nextNumber = match ? Number.parseInt(match[1], 10) + 1 : 1;

    return `${prefix}${nextNumber.toString().padStart(padLength, '0')}`;
  }

  private async activateDraftWarranty(
    repository: WarrantyActivationReviewTransactionRepository,
    input: {
      activatedByUserId?: string;
      startDate: Date;
      warrantyId: string;
    },
  ) {
    const warranty = await repository.findWarrantyForActivation(
      input.warrantyId,
    );
    if (!warranty) throw new NotFoundError('Warranty not found');
    if (warranty.status !== warranty_status.DRAFT) {
      throw new BadRequestError(
        'Warranty is not eligible for activation',
        'BAD_REQUEST',
        {
          code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
          currentStatus: warranty.status,
          expectedStatuses: [warranty_status.DRAFT],
        },
      );
    }
    if (!warranty.warranty_code) {
      throw new BadRequestError('Warranty code is required for activation');
    }

    const currentOwnership = warranty.product.ownerships[0];
    if (!currentOwnership) {
      throw new BadRequestError(
        'Warranty requires a current owner before activation',
        'BAD_REQUEST',
        { code: 'WARRANTY_OWNER_REQUIRED' },
      );
    }
    if (input.startDate.getTime() > Date.now()) {
      throw new BadRequestError(
        'Warranty start date cannot be in the future',
        'BAD_REQUEST',
        { code: 'WARRANTY_START_DATE_IN_FUTURE' },
      );
    }

    const transition = await repository.transitionWarranty(
      { id: warranty.id, status: warranty_status.DRAFT },
      {
        activated_by_id: input.activatedByUserId,
        end_date: addMonths(input.startDate, warranty.duration_months),
        start_date: input.startDate,
        status: warranty_status.ACTIVE,
      },
    );
    if (transition.count !== 1) {
      throw new ConflictError('Warranty status changed during activation');
    }

    await repository.markOwnershipActivated(
      currentOwnership.id,
      input.startDate,
    );

    return repository.findWarrantyByIdOrThrow(warranty.id);
  }
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}
