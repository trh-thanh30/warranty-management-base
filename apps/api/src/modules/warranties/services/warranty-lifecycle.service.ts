import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_activation_request_status,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';

const OPEN_CLAIM_STATUSES = [
  warranty_claim_status.SUBMITTED,
  warranty_claim_status.REVIEWING,
  warranty_claim_status.APPROVED,
  warranty_claim_status.IN_REPAIR,
] as const;

@Injectable()
export class WarrantyLifecycleService {
  async activateDraftWarranty(
    tx: Prisma.TransactionClient,
    input: {
      activatedByUserId?: string;
      startDate?: Date;
      warrantyId: string;
    },
  ) {
    const warranty = await tx.warranty.findUnique({
      where: { id: input.warrantyId },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              take: 1,
            },
          },
        },
      },
    });

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

    const startDate = input.startDate ?? new Date();
    if (startDate.getTime() > Date.now()) {
      throw new BadRequestError(
        'Warranty start date cannot be in the future',
        'BAD_REQUEST',
        { code: 'WARRANTY_START_DATE_IN_FUTURE' },
      );
    }
    const transition = await tx.warranty.updateMany({
      where: { id: warranty.id, status: warranty_status.DRAFT },
      data: {
        activated_by_id: input.activatedByUserId,
        end_date: addMonths(startDate, warranty.duration_months),
        start_date: startDate,
        status: warranty_status.ACTIVE,
      },
    });

    if (transition.count !== 1) {
      throw new ConflictError('Warranty status changed during activation');
    }

    await tx.productOwnership.update({
      where: { id: currentOwnership.id },
      data: { activated_at: startDate },
    });

    return tx.warranty.findUniqueOrThrow({ where: { id: warranty.id } });
  }

  async voidWarranty(
    tx: Prisma.TransactionClient,
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

    const warranty = await tx.warranty.findUnique({
      where: { id: input.warrantyId },
    });

    if (!warranty) throw new NotFoundError('Warranty not found');
    if (
      warranty.status !== warranty_status.DRAFT &&
      warranty.status !== warranty_status.ACTIVE
    ) {
      throw new BadRequestError(
        'Warranty is not eligible for voiding',
        'BAD_REQUEST',
        {
          code: 'WARRANTY_NOT_ELIGIBLE_FOR_VOIDING',
          currentStatus: warranty.status,
          expectedStatuses: [warranty_status.DRAFT, warranty_status.ACTIVE],
        },
      );
    }

    const openClaimCount = await tx.warrantyClaim.count({
      where: {
        warranty_id: warranty.id,
        status: { in: [...OPEN_CLAIM_STATUSES] },
      },
    });
    if (openClaimCount > 0) {
      throw new BadRequestError('Warranty has open claims', 'BAD_REQUEST', {
        code: 'WARRANTY_HAS_OPEN_CLAIMS',
        openClaimCount,
      });
    }

    const voidedAt = new Date();
    const transition = await tx.warranty.updateMany({
      where: {
        id: warranty.id,
        status: { in: [warranty_status.DRAFT, warranty_status.ACTIVE] },
      },
      data: {
        status: warranty_status.VOIDED,
        void_reason: reason,
        voided_at: voidedAt,
        voided_by_id: input.voidedByUserId,
      },
    });

    if (transition.count !== 1) {
      throw new ConflictError('Warranty status changed during voiding');
    }

    if (warranty.warranty_code) {
      await tx.warrantyActivationRequest.updateMany({
        where: {
          warranty_code: warranty.warranty_code,
          status: {
            in: [
              warranty_activation_request_status.PENDING,
              warranty_activation_request_status.APPROVED,
            ],
          },
        },
        data: {
          admin_note: `Tự động hủy do bảo hành bị vô hiệu: ${reason}`,
          reviewed_at: voidedAt,
          reviewed_by_id: input.voidedByUserId,
          status: warranty_activation_request_status.CANCELLED,
        },
      });
    }

    return tx.warranty.findUniqueOrThrow({ where: { id: warranty.id } });
  }
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}
