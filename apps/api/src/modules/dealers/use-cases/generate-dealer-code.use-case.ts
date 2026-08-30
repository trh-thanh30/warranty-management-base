import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

const DEALER_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class GenerateDealerCodeUseCase {
  execute(): string {
    const bytes = randomBytes(8);
    let suffix = '';
    for (const byte of bytes) {
      suffix += DEALER_CODE_ALPHABET[byte % DEALER_CODE_ALPHABET.length];
    }
    return `DLR-${suffix}`;
  }
}
