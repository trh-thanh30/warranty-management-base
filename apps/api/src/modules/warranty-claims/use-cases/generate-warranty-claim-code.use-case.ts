import type { IGenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/types/generate-warranty-claim-code.types';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

const CLAIM_CODE_PREFIX = 'CLM-';
const CLAIM_CODE_RANDOM_BYTES = 10;

@Injectable()
export class GenerateWarrantyClaimCodeUseCase implements IGenerateWarrantyClaimCodeUseCase {
  generateWarrantyClaimCodeBatch(count: number): Promise<string[]> {
    return Promise.resolve(
      Array.from({ length: count }, () => this.createRandomClaimCode()),
    );
  }

  generateWarrantyClaimCode(): Promise<string> {
    return Promise.resolve(this.createRandomClaimCode());
  }

  execute(): Promise<string> {
    return this.generateWarrantyClaimCode();
  }

  private createRandomClaimCode() {
    return `${CLAIM_CODE_PREFIX}${randomBytes(CLAIM_CODE_RANDOM_BYTES)
      .toString('hex')
      .toUpperCase()}`;
  }
}
