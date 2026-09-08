import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { WarrantyClaimNotificationService } from '@/modules/warranty-claims/service/warranty-claim-notification.service';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_claim_priority,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';
import { normalizePhoneNumber } from '@repo/shared/utils';

const CLAIM_CODE_GENERATION_ATTEMPTS = 3;

@Injectable()
export class CreateWarrantyClaimUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly generateWarrantyClaimCodeUseCase: GenerateWarrantyClaimCodeUseCase,
    private readonly warrantyClaimSlaService: WarrantyClaimSlaService,
    private readonly warrantyClaimNotificationService?: WarrantyClaimNotificationService,
  ) {}

  async execute(
    dto: CreateWarrantyClaimDto,
    context: { requireOwnerMatch?: boolean } = {},
  ) {
    const warrantyCode = dto.warrantyCode.trim().toUpperCase();
    const requesterName = dto.requesterName.trim();
    const requesterPhone = dto.requesterPhone.trim();
    const warranty =
      await this.warrantyClaimsRepository.findWarrantyByCode(warrantyCode);

    if (!warranty || warranty.product.deleted_at) {
      throw new NotFoundError('Warranty not found');
    }

    if (warranty.status !== warranty_status.ACTIVE) {
      const errorByStatus = {
        [warranty_status.DRAFT]: {
          code: 'WARRANTY_NOT_ACTIVE',
          message: 'Warranty is not active',
        },
        [warranty_status.EXPIRED]: {
          code: 'WARRANTY_EXPIRED',
          message: 'Warranty is expired',
        },
        [warranty_status.VOIDED]: {
          code: 'WARRANTY_VOIDED',
          message: 'Warranty is voided',
        },
      } as const;
      const error = errorByStatus[warranty.status];
      throw new BadRequestError(error.message, 'BAD_REQUEST', {
        code: error.code,
      });
    }

    const hasNotStarted =
      warranty.start_date && warranty.start_date.getTime() > Date.now();
    const hasExpired =
      warranty.end_date && warranty.end_date.getTime() < Date.now();
    if (hasNotStarted || hasExpired) {
      throw new BadRequestError(
        hasNotStarted ? 'Warranty is not active yet' : 'Warranty is expired',
        'BAD_REQUEST',
        {
          code: hasNotStarted ? 'WARRANTY_NOT_STARTED' : 'WARRANTY_EXPIRED',
        },
      );
    }

    const openClaim = await this.warrantyClaimsRepository.findOpenByWarrantyId(
      warranty.id,
    );
    if (openClaim) {
      this.throwOpenClaimError(warrantyCode, openClaim);
    }

    const currentOwnership = warranty.ownerships[0];
    if (
      context.requireOwnerMatch &&
      (!currentOwnership?.customer?.phone ||
        normalizePhoneNumber(currentOwnership.customer.phone) !==
          normalizePhoneNumber(requesterPhone))
    ) {
      throw new BadRequestError(
        'Requester phone does not match the current warranty owner',
        'WARRANTY_CLAIM_OWNER_MISMATCH',
      );
    }

    for (
      let attempt = 0;
      attempt < CLAIM_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const claimCode = await this.generateWarrantyClaimCodeUseCase.execute();
      const dueAt = this.warrantyClaimSlaService.calculateDueAt(
        warranty_claim_priority.NORMAL,
      );

      try {
        const claim = await this.warrantyClaimsRepository.create({
          claim_code: claimCode,
          warranty_code: warrantyCode,
          due_at: dueAt,
          requester_name: requesterName,
          requester_phone: requesterPhone,
          issue_title: dto.issueTitle,
          issue_detail: dto.issueDetail,
          warranty: { connect: { id: warranty.id } },
          product: { connect: { id: warranty.product.id } },
          customer: currentOwnership?.customer
            ? { connect: { id: currentOwnership.customer.id } }
            : undefined,
        });

        await this.warrantyClaimNotificationService?.claimCreated(claim);

        return toWarrantyClaimResponse(claim);
      } catch (error) {
        if (
          attempt < CLAIM_CODE_GENERATION_ATTEMPTS - 1 &&
          this.isClaimCodeConflict(error)
        ) {
          continue;
        }

        if (this.isUniqueConstraintConflict(error)) {
          const concurrentOpenClaim =
            await this.warrantyClaimsRepository.findOpenByWarrantyId(
              warranty.id,
            );
          if (concurrentOpenClaim) {
            this.throwOpenClaimError(warrantyCode, concurrentOpenClaim);
          }
        }

        throw error;
      }
    }

    throw new BadRequestError('Could not create warranty claim');
  }

  private isClaimCodeConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('claim_code')
    );
  }

  private isUniqueConstraintConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private throwOpenClaimError(
    warrantyCode: string,
    claim: {
      claim_code: string;
      status: warranty_claim_status;
    },
  ): never {
    throw new ConflictError(
      'Warranty already has an open claim',
      'WARRANTY_CLAIM_ALREADY_OPEN',
      {
        claimCode: claim.claim_code,
        currentStatus: claim.status,
        warrantyCode,
      },
    );
  }
}
