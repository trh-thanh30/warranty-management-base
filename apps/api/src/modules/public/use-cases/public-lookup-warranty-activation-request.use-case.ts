import { BadRequestError, NotFoundError } from '@/common/response';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';
import type { PublicWarrantyActivationRequestStatus } from '@repo/shared';
import {
  isWarrantyActivationRequestCode,
  normalizeWarrantyActivationRequestCode,
} from '@repo/shared/utils';

@Injectable()
export class PublicLookupWarrantyActivationRequestUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async execute(
    requestCode: string,
  ): Promise<PublicWarrantyActivationRequestStatus> {
    if (!isWarrantyActivationRequestCode(requestCode)) {
      throw new BadRequestError(
        'Warranty activation request code is invalid',
        'WARRANTY_ACTIVATION_REQUEST_CODE_INVALID',
      );
    }

    const request =
      await this.warrantyActivationRequestsRepository.findPublicStatusByRequestCode(
        normalizeWarrantyActivationRequestCode(requestCode),
      );

    if (!request) {
      throw new NotFoundError(
        'Warranty activation request not found',
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
      );
    }

    return {
      requestCode: request.request_code,
      status: request.status,
      createdAt: request.created_at.toISOString(),
      reviewedAt: request.reviewed_at?.toISOString() ?? null,
      updatedAt: request.updated_at.toISOString(),
    };
  }
}
