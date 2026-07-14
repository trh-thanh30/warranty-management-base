import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import type { IGenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/types/generate-warranty-claim-code.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateWarrantyClaimCodeUseCase implements IGenerateWarrantyClaimCodeUseCase {
  private readonly prefix = 'CLM';
  private readonly padLength = 6;

  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async generateWarrantyClaimCodeBatch(count: number): Promise<string[]> {
    const lastClaimCode = await this.warrantyClaimsRepository.findLastClaimCode(
      this.prefix,
    );
    const startNumber = this.getNextNumber(lastClaimCode?.claim_code);

    const codes: string[] = [];
    for (let index = 0; index < count; index += 1) {
      codes.push(
        `${this.prefix}${(startNumber + index)
          .toString()
          .padStart(this.padLength, '0')}`,
      );
    }

    return codes;
  }

  async generateWarrantyClaimCode(): Promise<string> {
    const codes = await this.generateWarrantyClaimCodeBatch(1);
    return codes[0];
  }

  async execute(): Promise<string> {
    return this.generateWarrantyClaimCode();
  }

  private getNextNumber(lastClaimCode?: string) {
    if (!lastClaimCode) {
      return 1;
    }

    const match = lastClaimCode.match(
      new RegExp(`^${this.prefix}(\\d{${this.padLength},})$`),
    );

    if (!match) {
      return 1;
    }

    return Number.parseInt(match[1], 10) + 1;
  }
}
