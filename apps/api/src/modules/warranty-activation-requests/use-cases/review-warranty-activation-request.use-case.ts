import { BadRequestError, NotFoundError } from '@/common/response';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { optionalTrim } from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { Injectable } from '@nestjs/common';
import { warranty_activation_request_status } from '@prisma/client';

@Injectable()
export class ReviewWarrantyActivationRequestUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
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
      const activatedRequest =
        await this.warrantyActivationRequestsRepository.activateApprovedRequest(
          {
            adminNote: optionalTrim(dto.adminNote),
            id,
            reviewedById: context.reviewedByUserId,
          },
        );

      if (!activatedRequest) {
        throw new NotFoundError('Warranty activation request target not found');
      }

      if (activatedRequest.activated_warranty_id) {
        await this.issueWarrantyCertificateUseCase.execute({
          recipientEmail: activatedRequest.customer_email ?? undefined,
          requestId: activatedRequest.id,
          warrantyId: activatedRequest.activated_warranty_id,
        });
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
}
