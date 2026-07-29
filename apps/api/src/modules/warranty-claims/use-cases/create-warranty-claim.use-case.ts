import { BadRequestError, NotFoundError } from '@/common/response';
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
  warranty_status,
} from '@prisma/client';

const CLAIM_CODE_GENERATION_ATTEMPTS = 3;

@Injectable()
export class CreateWarrantyClaimUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly generateWarrantyClaimCodeUseCase: GenerateWarrantyClaimCodeUseCase,
    private readonly warrantyClaimSlaService?: WarrantyClaimSlaService,
    private readonly warrantyClaimNotificationService?: WarrantyClaimNotificationService,
  ) {}

  async execute(dto: CreateWarrantyClaimDto) {
    const warrantyCode = dto.warrantyCode.trim().toUpperCase();
    const requesterName = dto.requesterName.trim();
    const requesterPhone = dto.requesterPhone.trim();
    const product =
      await this.warrantyClaimsRepository.findWarrantyProductByCode(
        warrantyCode,
      );

    if (!product?.warranty) {
      throw new NotFoundError('Warranty not found');
    }

    if (product.warranty.status !== warranty_status.ACTIVE) {
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
      const error = errorByStatus[product.warranty.status];
      throw new BadRequestError(error.message, 'BAD_REQUEST', {
        code: error.code,
      });
    }

    const hasNotStarted =
      product.warranty.start_date &&
      product.warranty.start_date.getTime() > Date.now();
    const hasExpired =
      product.warranty.end_date &&
      product.warranty.end_date.getTime() < Date.now();
    if (hasNotStarted || hasExpired) {
      throw new BadRequestError(
        hasNotStarted ? 'Warranty is not active yet' : 'Warranty is expired',
        'BAD_REQUEST',
        {
          code: hasNotStarted ? 'WARRANTY_NOT_STARTED' : 'WARRANTY_EXPIRED',
        },
      );
    }

    const currentOwnership = product.ownerships[0];

    for (
      let attempt = 0;
      attempt < CLAIM_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const claimCode = await this.generateWarrantyClaimCodeUseCase.execute();
      const dueAt =
        this.warrantyClaimSlaService?.calculateDueAt(
          warranty_claim_priority.NORMAL,
        ) ?? this.defaultDueAt();

      try {
        const claim = await this.warrantyClaimsRepository.create({
          claim_code: claimCode,
          warranty_code: warrantyCode,
          due_at: dueAt,
          requester_name: requesterName,
          requester_phone: requesterPhone,
          issue_title: dto.issueTitle,
          issue_detail: dto.issueDetail,
          warranty: { connect: { id: product.warranty.id } },
          product: { connect: { id: product.id } },
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

  private defaultDueAt() {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 3);
    return dueAt;
  }
}
