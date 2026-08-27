import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { WarrantyTransactionRepository } from '@/modules/warranties/repository/warranty-transaction.repository';
import {
  WARRANTY_ACTIVATION_REQUEST_STATUS,
  WARRANTY_CLAIM_STATUS,
  WARRANTY_STATUS,
} from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

const OPEN_CLAIM_STATUSES = [
  WARRANTY_CLAIM_STATUS.SUBMITTED,
  WARRANTY_CLAIM_STATUS.REVIEWING,
  WARRANTY_CLAIM_STATUS.APPROVED,
  WARRANTY_CLAIM_STATUS.IN_REPAIR,
] as const;

@Injectable()
export class WarrantyLifecycleService {
  async activateDraftWarranty(
    repository: WarrantyTransactionRepository,
    input: {
      activatedByUserId?: string;
      startDate?: Date;
      warrantyId: string;
    },
  ) {
    const warranty = await repository.findWarrantyForActivation(
      input.warrantyId,
    );

    if (!warranty) throw new NotFoundError('Warranty not found');
    if (warranty.status !== WARRANTY_STATUS.DRAFT) {
      throw new BadRequestError(
        'Warranty is not eligible for activation',
        'BAD_REQUEST',
        {
          code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
          currentStatus: warranty.status,
          expectedStatuses: [WARRANTY_STATUS.DRAFT],
        },
      );
    }
    if (!warranty.warrantyCode) {
      throw new BadRequestError('Warranty code is required for activation');
    }

    if (!warranty.currentOwnershipId) {
      throw new BadRequestError(
        'Warranty requires a current owner before activation',
        'BAD_REQUEST',
        { code: 'WARRANTY_OWNER_REQUIRED' },
      );
    }

    const startDate = input.startDate ?? new Date();
    if (startDate.getTime() > Date.now()) {
      throw new BadRequestError(
        'Warranty start date cannot be in the future',
        'BAD_REQUEST',
        { code: 'WARRANTY_START_DATE_IN_FUTURE' },
      );
    }
    const transition = await repository.activateDraftWarranty({
      activatedByUserId: input.activatedByUserId,
      endDate: this.addMonths(startDate, warranty.durationMonths),
      startDate,
      warrantyId: warranty.id,
    });

    if (transition.count !== 1) {
      throw new ConflictError('Warranty status changed during activation');
    }

    await repository.markOwnershipActivated(
      warranty.currentOwnershipId,
      startDate,
    );

    return repository.findWarrantyByIdOrThrow(warranty.id);
  }

  async voidWarranty(
    repository: WarrantyTransactionRepository,
    input: {
      reason: string;
      voidedByUserId: string;
      warrantyId: string;
    },
  ) {
    const reason = input.reason.trim();
    if (reason.length < 3) {
      throw new BadRequestError(
        'Warranty void reason must contain at least 3 characters',
        'BAD_REQUEST',
        { code: 'WARRANTY_VOID_REASON_REQUIRED' },
      );
    }

    const warranty = await repository.findWarrantyForVoid(input.warrantyId);

    if (!warranty) throw new NotFoundError('Warranty not found');
    if (
      warranty.status !== WARRANTY_STATUS.DRAFT &&
      warranty.status !== WARRANTY_STATUS.ACTIVE
    ) {
      throw new BadRequestError(
        'Warranty is not eligible for voiding',
        'BAD_REQUEST',
        {
          code: 'WARRANTY_NOT_ELIGIBLE_FOR_VOIDING',
          currentStatus: warranty.status,
          expectedStatuses: [WARRANTY_STATUS.DRAFT, WARRANTY_STATUS.ACTIVE],
        },
      );
    }

    const openClaimCount = await repository.countOpenClaims(warranty.id, [
      ...OPEN_CLAIM_STATUSES,
    ]);
    if (openClaimCount > 0) {
      throw new BadRequestError('Warranty has open claims', 'BAD_REQUEST', {
        code: 'WARRANTY_HAS_OPEN_CLAIMS',
        openClaimCount,
      });
    }

    const voidedAt = new Date();
    const transition = await repository.voidEligibleWarranty({
      reason,
      voidedAt,
      voidedByUserId: input.voidedByUserId,
      warrantyId: warranty.id,
    });

    if (transition.count !== 1) {
      throw new ConflictError('Warranty status changed during voiding');
    }

    if (warranty.warrantyCode) {
      const openRequests = await repository.findOpenActivationRequestIds(
        warranty.id,
        warranty.warrantyCode,
        [
          WARRANTY_ACTIVATION_REQUEST_STATUS.PENDING,
          WARRANTY_ACTIVATION_REQUEST_STATUS.APPROVED,
        ],
      );
      const requestIds = openRequests.map((request) => request.id);

      if (requestIds.length > 0) {
        await repository.cancelActivationRequestItems(
          requestIds,
          WARRANTY_ACTIVATION_REQUEST_STATUS.CANCELLED,
        );
        await repository.cancelActivationRequests({
          adminNote: `Tự động hủy do bảo hành bị vô hiệu: ${reason}`,
          requestIds,
          reviewedAt: voidedAt,
          reviewedById: input.voidedByUserId,
          status: WARRANTY_ACTIVATION_REQUEST_STATUS.CANCELLED,
        });
      }
    }

    return repository.findWarrantyByIdOrThrow(warranty.id);
  }

  private addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }
}
