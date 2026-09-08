import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateWarrantyDto } from '@/modules/warranties/dto/update-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { UsersService } from '@/modules/user/user.service';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import type {
  WarrantyAdjustmentChange,
  WarrantyAdjustmentHistoryEntry,
  WarrantyAdjustmentMetadata,
  WarrantyAdjustmentValue,
} from '@repo/shared';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_status } from '@prisma/client';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

const MUTABLE_FIELDS = [
  'coverageLimitAmount',
  'durationMonths',
  'maxAmountPerClaim',
  'maxClaimCount',
  'terms',
] as const;

@Injectable()
export class UpdateWarrantyUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly usersService: UsersService,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    id: string,
    dto: UpdateWarrantyDto,
    context: {
      adjustedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
  ) {
    const warranty = await this.warrantiesRepository.findById(id);
    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }
    if (context.actor) {
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        context.actor,
        warranty.dealer_id,
      );
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

    const changes = buildAdjustmentChanges(warranty, dto, {
      coverageLimitAmount,
      maxAmountPerClaim,
    });
    const changedFields = Object.keys(changes);
    if (changedFields.length === 0) {
      throw new BadRequestError(
        'At least one warranty field must be changed',
        'WARRANTY_ADJUSTMENT_NO_CHANGES',
      );
    }

    const adjustedByUser = context.adjustedByUserId
      ? await this.usersService.findAccountById(context.adjustedByUserId)
      : null;

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
        changes,
        reason: stripHtml(dto.adjustmentReason).trim(),
        adjustedByUser: adjustedByUser
          ? {
              id: adjustedByUser.id,
              email: adjustedByUser.email,
              name: adjustedByUser.fullName,
            }
          : null,
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
    changes: Record<string, WarrantyAdjustmentChange>;
    reason: string;
    adjustedByUser: {
      id: string;
      email: string;
      name: string | null;
    } | null;
  },
) {
  const metadata =
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const currentMetadata = metadata as WarrantyAdjustmentMetadata;
  const history = Array.isArray(currentMetadata.adjustmentHistory)
    ? currentMetadata.adjustmentHistory
    : currentMetadata.lastAdjustment
      ? [
          {
            adjustedAt: currentMetadata.lastAdjustment.adjustedAt,
            adjustedByUserId:
              currentMetadata.lastAdjustment.adjustedByUserId ?? null,
            adjustedByUser:
              currentMetadata.lastAdjustment.adjustedByUser ?? null,
            changedFields: [...currentMetadata.lastAdjustment.changedFields],
            changes: currentMetadata.lastAdjustment.changes ?? {},
            reason: currentMetadata.lastAdjustment.reason,
          },
        ]
      : [];
  const entry: WarrantyAdjustmentHistoryEntry = {
    adjustedAt: new Date().toISOString(),
    adjustedByUserId: adjustment.adjustedByUserId ?? null,
    adjustedByUser: adjustment.adjustedByUser,
    changedFields: [...adjustment.changedFields],
    changes: adjustment.changes,
    reason: adjustment.reason,
  };

  return {
    ...metadata,
    adjustmentHistory: [...history, entry],
    lastAdjustment: entry,
  } satisfies Prisma.InputJsonObject;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAdjustmentChanges(
  warranty: {
    coverage_limit_amount: Prisma.Decimal | null;
    duration_months: number;
    max_amount_per_claim: Prisma.Decimal | null;
    max_claim_count: number | null;
    terms: string | null;
  },
  dto: UpdateWarrantyDto,
  normalized: {
    coverageLimitAmount: Prisma.Decimal | null;
    maxAmountPerClaim: Prisma.Decimal | null;
  },
) {
  const before: Record<string, WarrantyAdjustmentValue> = {
    coverageLimitAmount: toAdjustmentValue(warranty.coverage_limit_amount),
    durationMonths: warranty.duration_months,
    maxAmountPerClaim: toAdjustmentValue(warranty.max_amount_per_claim),
    maxClaimCount: warranty.max_claim_count,
    terms: warranty.terms,
  };
  const after: Record<string, WarrantyAdjustmentValue> = {
    coverageLimitAmount: toAdjustmentValue(normalized.coverageLimitAmount),
    durationMonths: dto.durationMonths ?? warranty.duration_months,
    maxAmountPerClaim: toAdjustmentValue(normalized.maxAmountPerClaim),
    maxClaimCount:
      dto.maxClaimCount === undefined
        ? warranty.max_claim_count
        : dto.maxClaimCount,
    terms:
      dto.terms === undefined
        ? warranty.terms
        : dto.terms === null
          ? null
          : dto.terms.trim() || null,
  };

  return MUTABLE_FIELDS.reduce<Record<string, WarrantyAdjustmentChange>>(
    (changes, field) => {
      if (!areAdjustmentValuesEqual(before[field], after[field])) {
        changes[field] = { before: before[field], after: after[field] };
      }
      return changes;
    },
    {},
  );
}

function toAdjustmentValue(value: Prisma.Decimal | null) {
  return value?.toString() ?? null;
}

function areAdjustmentValuesEqual(
  before: WarrantyAdjustmentValue,
  after: WarrantyAdjustmentValue,
) {
  return before === after;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}
