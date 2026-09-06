import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RANDOM_LENGTH = 16;

@Injectable()
export class GenerateActivationCodeUseCase {
  execute(): string {
    const bytes = randomBytes(RANDOM_LENGTH);
    let suffix = '';
    for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
    return `SP-${suffix}`;
  }

  executeBatch(quantity: number): string[] {
    const codes = new Set<string>();
    while (codes.size < quantity) codes.add(this.execute());
    return [...codes];
  }
}
