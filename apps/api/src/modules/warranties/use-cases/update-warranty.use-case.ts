import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateWarrantyDto } from '@/modules/warranties/dto/update-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_status } from '@prisma/client';

const MUTABLE_FIELDS = [
  'coverageLimitAmount',
  'durationMonths',
  'maxAmountPerClaim',
  'maxClaimCount',
  'terms',
] as const;

@Injectable()
export class UpdateWarrantyUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(
    id: string,
    dto: UpdateWarrantyDto,
    context: { adjustedByUserId?: string } = {},
  ) {
    const warranty = await this.warrantiesRepository.findById(id);
    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    if (
      warranty.status === warranty_status.EXPIRED ||
      warranty.status === warranty_status.VOIDED
    ) {
      throw new BadRequestError(
        'Expired or voided warranties cannot be adjusted',
        'WARRANTY_NOT_ADJUSTABLE',
        { currentStatus: warranty.status },
      );
    }

    const changedFields = MUTABLE_FIELDS.filter(
      (field) => dto[field] !== undefined,
    );
    if (changedFields.length === 0) {
      throw new BadRequestError(
        'At least one warranty field must be provided',
        'WARRANTY_ADJUSTMENT_EMPTY',
      );
    }

    const coverageLimitAmount = toDecimalOrNull(
      dto.coverageLimitAmount,
      warranty.coverage_limit_amount,
    );
    const maxAmountPerClaim = toDecimalOrNull(
      dto.maxAmountPerClaim,
      warranty.max_amount_per_claim,
    );

    if (
      coverageLimitAmount &&
      maxAmountPerClaim &&
      maxAmountPerClaim.greaterThan(coverageLimitAmount)
    ) {
      throw new BadRequestError(
        'Maximum amount per claim cannot exceed the total coverage limit',
        'WARRANTY_CLAIM_LIMIT_EXCEEDS_COVERAGE',
      );
    }

    let endDate: Date | undefined;
    if (dto.durationMonths !== undefined && warranty.status === 'ACTIVE') {
      if (!warranty.start_date) {
        throw new BadRequestError(
          'Active warranty must have a start date',
          'WARRANTY_START_DATE_REQUIRED',
        );
      }
      endDate = addMonths(warranty.start_date, dto.durationMonths);
    }

    const updatedWarranty = await this.warrantiesRepository.update(id, {
      coverage_limit_amount:
        dto.coverageLimitAmount === undefined ? undefined : coverageLimitAmount,
      duration_months: dto.durationMonths,
      end_date: endDate,
      max_amount_per_claim:
        dto.maxAmountPerClaim === undefined ? undefined : maxAmountPerClaim,
      max_claim_count: dto.maxClaimCount,
      metadata: mergeAdjustmentMetadata(warranty.metadata, {
        adjustedByUserId: context.adjustedByUserId,
        changedFields,
        reason: dto.adjustmentReason.trim(),
      }),
      terms: dto.terms === undefined ? undefined : dto.terms?.trim() || null,
    });

    return toWarrantyListItemResponse(updatedWarranty);
  }
}

function toDecimalOrNull(
  value: string | null | undefined,
  fallback: Prisma.Decimal | null,
) {
  if (value === undefined) return fallback;
  if (value === null) return null;

  const decimal = new Prisma.Decimal(value);
  if (decimal.isNegative()) {
    throw new BadRequestError(
      'Warranty monetary limits cannot be negative',
      'WARRANTY_LIMIT_NEGATIVE',
    );
  }
  return decimal;
}

function mergeAdjustmentMetadata(
  value: Prisma.JsonValue,
  adjustment: {
    adjustedByUserId?: string;
    changedFields: readonly string[];
    reason: string;
  },
) {
  const metadata =
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return {
    ...metadata,
    lastAdjustment: {
      adjustedAt: new Date().toISOString(),
      adjustedByUserId: adjustment.adjustedByUserId ?? null,
      changedFields: [...adjustment.changedFields],
      reason: adjustment.reason,
    },
  } satisfies Prisma.InputJsonObject;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}
