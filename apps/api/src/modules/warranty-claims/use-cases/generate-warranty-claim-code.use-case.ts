import type { IGenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/types/generate-warranty-claim-code.types';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

const CLAIM_CODE_PREFIX = 'CLM-';
const CLAIM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CLAIM_CODE_SUFFIX_LENGTH = 6;

@Injectable()
export class GenerateWarrantyClaimCodeUseCase implements IGenerateWarrantyClaimCodeUseCase {
  generateWarrantyClaimCodeBatch(count: number): Promise<string[]> {
    const generatedCodes = new Set<string>();
    return Promise.resolve(
      Array.from({ length: count }, () => {
        let code = this.createRandomClaimCode();
        while (generatedCodes.has(code)) code = this.createRandomClaimCode();
        generatedCodes.add(code);
        return code;
      }),
    );
  }

  generateWarrantyClaimCode(): Promise<string> {
    return Promise.resolve(this.createRandomClaimCode());
  }

  execute(): Promise<string> {
    return this.generateWarrantyClaimCode();
  }

  private createRandomClaimCode() {
    const suffix = Array.from(
      { length: CLAIM_CODE_SUFFIX_LENGTH },
      () => CLAIM_CODE_ALPHABET[randomInt(CLAIM_CODE_ALPHABET.length)],
    ).join('');
    return `${CLAIM_CODE_PREFIX}${new Date().getFullYear()}-${suffix}`;
  }
}
