import { BadRequestError, NotFoundError } from '@/common/response';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_status } from '@prisma/client';

const CLAIM_CODE_GENERATION_ATTEMPTS = 3;

@Injectable()
export class CreateWarrantyClaimUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly generateWarrantyClaimCodeUseCase: GenerateWarrantyClaimCodeUseCase,
  ) {}

  async execute(dto: CreateWarrantyClaimDto) {
    const warrantyCode = dto.warrantyCode.trim().toUpperCase();
    const product =
      await this.warrantyClaimsRepository.findWarrantyProductByCode(
        warrantyCode,
      );

    if (!product?.warranty) {
      throw new NotFoundError('Warranty not found');
    }

    if (product.warranty.status === warranty_status.VOIDED) {
      throw new BadRequestError('Warranty is voided');
    }

    const currentOwnership = product.ownerships[0];

    for (
      let attempt = 0;
      attempt < CLAIM_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const claimCode = await this.generateWarrantyClaimCodeUseCase.execute();

      try {
        const claim = await this.warrantyClaimsRepository.create({
          claim_code: claimCode,
          warranty_code: product.warranty_code,
          requester_name: dto.requesterName,
          requester_phone: dto.requesterPhone,
          issue_title: dto.issueTitle,
          issue_detail: dto.issueDetail,
          warranty: { connect: { id: product.warranty.id } },
          product: { connect: { id: product.id } },
          customer: currentOwnership?.customer
            ? { connect: { id: currentOwnership.customer.id } }
            : undefined,
        });

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
}
