import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationReviewTransactionRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-review-transaction.repository';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { optionalTrim } from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import {
  buildActivationEligibilityError,
  getActivationEligibilityFailure,
  getWarrantyActivationReviewErrorMessage,
  WarrantyActivationReviewLocale,
  WarrantyActivationReviewTarget,
} from '@/modules/warranty-activation-requests/utils/warranty-activation-review-error.utils';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { Injectable, Logger } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';
import {
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';
import { addCalendarMonths } from '@repo/shared/utils';

@Injectable()
export class ReviewWarrantyActivationRequestUseCase {
  private readonly logger = new Logger(
    ReviewWarrantyActivationRequestUseCase.name,
  );

  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly issueRequestCertificate: IssueWarrantyActivationRequestCertificateUseCase,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    id: string,
    dto: ReviewWarrantyActivationRequestDto,
    context: {
      reviewedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
  ) {
    const locale = dto.locale ?? 'vi';
    const existingRequest =
      await this.warrantyActivationRequestsRepository.findById(id);

    if (!existingRequest) {
      throw new NotFoundError(
        getWarrantyActivationReviewErrorMessage(
          'REQUEST_NOT_FOUND',
          locale,
          id,
        ),
        'NOT_FOUND',
        { code: 'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND', requestId: id },
      );
    }
    if (context.actor) {
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        context.actor,
        existingRequest.dealer_id,
      );
    }

    const canActivateApprovedRequest =
      existingRequest.status === warranty_activation_request_status.APPROVED &&
      dto.status === warranty_activation_request_status.APPROVED;

    if (
      existingRequest.status !== warranty_activation_request_status.PENDING &&
      !canActivateApprovedRequest
    ) {
      throw new BadRequestError(
        getWarrantyActivationReviewErrorMessage(
          'REQUEST_NOT_PENDING',
          locale,
          existingRequest.status,
        ),
        'BAD_REQUEST',
        {
          code: 'WARRANTY_ACTIVATION_REQUEST_NOT_PENDING',
          currentStatus: existingRequest.status,
        },
      );
    }

    if (
      dto.status === warranty_activation_request_status.REJECTED &&
      !dto.rejectionReason?.trim()
    ) {
      throw new BadRequestError(
        getWarrantyActivationReviewErrorMessage(
          'REJECTION_REASON_REQUIRED',
          locale,
        ),
        'BAD_REQUEST',
        { code: 'REJECTION_REASON_REQUIRED' },
      );
    }

    if (dto.status === warranty_activation_request_status.APPROVED) {
      const activatedRequest = await this.activateApprovedRequest({
        adminNote: optionalTrim(dto.adminNote),
        id,
        locale,
        reviewedById: context.reviewedByUserId,
      });

      if (!activatedRequest) {
        throw new NotFoundError(
          getWarrantyActivationReviewErrorMessage(
            'REQUEST_TARGET_NOT_FOUND',
            locale,
          ),
          'NOT_FOUND',
          { code: 'WARRANTY_ACTIVATION_REQUEST_TARGET_NOT_FOUND' },
        );
      }

      try {
        await this.issueRequestCertificate.execute({
          recipientEmail:
            activatedRequest.customer_email ??
            activatedRequest.dealer?.email ??
            undefined,
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
    locale: WarrantyActivationReviewLocale;
    reviewedById?: string;
  }) {
    return this.warrantyActivationRequestsRepository.withReviewTransaction(
      async (repository) => {
        const request = await repository.findRequest(input.id);
        if (!request) return null;

        if (request.activated_warranty_id) {
          throw new BadRequestError(
            getWarrantyActivationReviewErrorMessage(
              'REQUEST_ALREADY_ACTIVATED',
              input.locale,
            ),
            'BAD_REQUEST',
            { code: 'ACTIVATION_REQUEST_ALREADY_ACTIVATED' },
          );
        }

        const targets: WarrantyActivationReviewTarget[] = request.items.length
          ? request.items.map((item) => ({
              itemId: item.id,
              activationCodeId: item.activation_code_id,
              positionLabel: item.position_label,
              product: item.product,
              productName: item.product_name,
              warrantyId: item.warranty_id ?? '',
              warrantyCode: item.warranty_code ?? request.warranty_code,
            }))
          : await this.resolveLegacyActivationTargets(
              repository,
              request.warranty_code,
              request.product_name,
            );
        if (targets.length === 0) return null;

        for (const target of targets) {
          const reason = getActivationEligibilityFailure(target);
          if (reason) {
            const error = buildActivationEligibilityError(
              target,
              reason,
              input.locale,
            );
            throw new BadRequestError(
              error.message,
              'BAD_REQUEST',
              error.details,
            );
          }
        }

        const reviewedAt = new Date();
        const customer = await this.resolveActivationCustomer(repository, {
          address: request.full_address,
          customerId: request.customer_id,
          email: request.customer_email,
          fullName: request.customer_name,
          locale: input.locale,
          phone: request.customer_phone,
        });
        const activatedWarrantyIds: string[] = [];
        const warrantyStartAt = request.installed_at ?? reviewedAt;

        for (const target of targets) {
          const updatedWarranty = await this.activateDraftWarranty(repository, {
            activatedByUserId: input.reviewedById,
            locale: input.locale,
            positionLabel: target.positionLabel,
            productId: target.product.id,
            productName: target.productName,
            startDate: warrantyStartAt,
            warrantyCode: target.warrantyCode,
            warrantyId: target.warrantyId,
            activationCodeId: target.activationCodeId ?? null,
            warrantyDurationMonths:
              target.product.warranty_duration_months ??
              target.product.warranty?.duration_months ??
              0,
            warrantyMethod:
              target.product.warranty_method ?? target.product.warranty?.method,
            warrantyTerms:
              target.product.warranty_terms ?? target.product.warranty?.terms,
            dealerId: request.dealer_id,
          });
          await repository.createWarrantyOwnership({
            customerId: customer.id,
            ownerUserId: customer.user_id,
            warrantyId: updatedWarranty.id,
            purchaseDate: reviewedAt,
            activatedAt: reviewedAt,
          });
          activatedWarrantyIds.push(updatedWarranty.id);
          if (target.itemId) {
            await repository.linkItemWarranty({
              itemId: target.itemId,
              warrantyCode: target.warrantyCode,
              warrantyId: updatedWarranty.id,
            });
          }
        }

        await repository.markItemsActivated(input.id, reviewedAt);

        const activationCodeIds = new Set(
          targets.flatMap((target) =>
            target.activationCodeId ? [target.activationCodeId] : [],
          ),
        );
        if (request.activation_code_id) {
          activationCodeIds.add(request.activation_code_id);
        }
        if (activationCodeIds.size > 0) {
          const updatedCode = await repository.markActivationCodesActivated(
            [...activationCodeIds],
            reviewedAt,
          );
          if (updatedCode.count !== activationCodeIds.size) {
            throw new ConflictError(
              'Activation code has already been activated or revoked',
              'ACTIVATION_CODE_ALREADY_USED',
            );
          }
        }

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
    productName?: string | null,
  ) {
    const product = await repository.findLegacyProduct(warrantyCode);
    if (!product?.warranty) return [];

    return [
      {
        product,
        productName,
        activationCodeId: null,
        warrantyId: product.warranty.id,
        warrantyCode,
      },
    ];
  }

  private async resolveActivationCustomer(
    repository: WarrantyActivationReviewTransactionRepository,
    input: {
      address: string;
      customerId: string | null;
      email: string | null;
      fullName: string;
      locale: WarrantyActivationReviewLocale;
      phone: string;
    },
  ) {
    if (input.customerId) {
      const customer = await repository.findCustomerById(input.customerId);
      if (!customer) {
        throw new NotFoundError(
          getWarrantyActivationReviewErrorMessage(
            'CUSTOMER_NOT_FOUND',
            input.locale,
            input.customerId,
          ),
          'NOT_FOUND',
          {
            code: 'CUSTOMER_NOT_FOUND',
            customerId: input.customerId,
          },
        );
      }

      return customer;
    }

    const customersByPhone = repository.findCustomersByPhone
      ? await repository.findCustomersByPhone(input.phone)
      : await this.findLegacyCustomerByPhone(repository, input.phone);

    if (customersByPhone.length > 1) {
      throw new BadRequestError(
        'Multiple customer profiles use this phone number. Select a customer profile before approving.',
        'CUSTOMER_SELECTION_REQUIRED',
        { customerIds: customersByPhone.map((customer) => customer.id) },
      );
    }

    const existingCustomer = customersByPhone[0];

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
      customer_code:
        await this.generateCustomerCodeUseCase.generateCustomerCode(repository),
    });
  }

  private async findLegacyCustomerByPhone(
    repository: WarrantyActivationReviewTransactionRepository,
    phone: string,
  ) {
    const customer = await repository.findCustomerByPhone(phone);
    return customer ? [customer] : [];
  }

  private async activateDraftWarranty(
    repository: WarrantyActivationReviewTransactionRepository,
    input: {
      activatedByUserId?: string;
      locale: WarrantyActivationReviewLocale;
      positionLabel?: string;
      productId: string;
      productName?: string | null;
      startDate: Date;
      warrantyCode: string;
      warrantyId: string;
      activationCodeId: string | null;
      warrantyDurationMonths: number;
      warrantyMethod?: import('@prisma/client').warranty_method;
      warrantyTerms?: string | null;
      dealerId?: string | null;
    },
  ) {
    const warranty = input.warrantyId
      ? await repository.findWarrantyForActivation(input.warrantyId)
      : await repository.createWarrantyForActivation({
          activationCodeId: input.activationCodeId,
          durationMonths: input.warrantyDurationMonths,
          productId: input.productId,
          warrantyCode: input.warrantyCode,
          method: input.warrantyMethod,
          terms: input.warrantyTerms,
          dealerId: input.dealerId,
        });
    if (!warranty) {
      throw new NotFoundError(
        getWarrantyActivationReviewErrorMessage(
          'WARRANTY_NOT_FOUND',
          input.locale,
          input.warrantyCode,
        ),
        'NOT_FOUND',
        {
          code: 'WARRANTY_NOT_FOUND',
          warrantyCode: input.warrantyCode,
          warrantyId: input.warrantyId,
        },
      );
    }
    if (warranty.status !== warranty_status.DRAFT) {
      const error = buildActivationEligibilityError(
        {
          positionLabel: input.positionLabel,
          product: {
            deleted_at: warranty.product.deleted_at,
            id: input.productId,
            status: warranty.product.status,
            warranty: { id: warranty.id, status: warranty.status },
          },
          productName: input.productName,
          warrantyCode: input.warrantyCode,
          warrantyId: input.warrantyId,
        },
        'WARRANTY_STATUS_NOT_DRAFT',
        input.locale,
      );
      throw new BadRequestError(error.message, 'BAD_REQUEST', error.details);
    }
    if (!warranty.warranty_code) {
      throw new BadRequestError(
        getWarrantyActivationReviewErrorMessage(
          'WARRANTY_CODE_REQUIRED',
          input.locale,
          input.warrantyId,
        ),
        'BAD_REQUEST',
        { code: 'WARRANTY_CODE_REQUIRED', warrantyId: input.warrantyId },
      );
    }

    if (input.dealerId && warranty.dealer_id !== input.dealerId) {
      await repository.assignWarrantyDealer(warranty.id, input.dealerId);
    }

    if (input.startDate.getTime() > Date.now()) {
      throw new BadRequestError(
        getWarrantyActivationReviewErrorMessage(
          'WARRANTY_START_DATE_IN_FUTURE',
          input.locale,
        ),
        'BAD_REQUEST',
        { code: 'WARRANTY_START_DATE_IN_FUTURE' },
      );
    }

    const transition = await repository.transitionWarranty(
      { id: warranty.id, status: warranty_status.DRAFT },
      {
        activated_by_id: input.activatedByUserId,
        end_date: addCalendarMonths(input.startDate, warranty.duration_months),
        start_date: input.startDate,
        status: warranty_status.ACTIVE,
      },
    );
    if (transition.count !== 1) {
      throw new ConflictError(
        getWarrantyActivationReviewErrorMessage(
          'WARRANTY_STATUS_CHANGED',
          input.locale,
          input.warrantyCode,
        ),
        'CONFLICT',
        {
          code: 'WARRANTY_STATUS_CHANGED_DURING_ACTIVATION',
          warrantyCode: input.warrantyCode,
          warrantyId: input.warrantyId,
        },
      );
    }

    await repository.setCurrentWarranty(input.productId, warranty.id);

    return repository.findWarrantyByIdOrThrow(warranty.id);
  }
}
