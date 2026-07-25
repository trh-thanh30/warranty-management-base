import { BadRequestError } from '@/common/response';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const PRODUCT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PRODUCT_CODE_SUFFIX_LENGTH = 6;
const MAX_BATCH_SIZE = 1_000;
const MAX_BATCH_COLLISION_ATTEMPTS = 5_000;

@Injectable()
export class GenerateProductCodeUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(date = new Date(), tx?: Prisma.TransactionClient) {
    const year = date.getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = this.generateRandomSuffix();
      const code = `PRD-${year}-${suffix}`;
      const existing = await this.findByProductCode(code, tx);

      if (!existing) return code;
    }

    throw new BadRequestError('Could not generate a unique product code');
  }

  async executeBatch(
    count: number,
    date = new Date(),
    tx?: Prisma.TransactionClient,
  ) {
    if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH_SIZE) {
      throw new BadRequestError(
        `Product code batch size must be between 1 and ${MAX_BATCH_SIZE}`,
      );
    }

    const prefix = `PRD-${date.getFullYear()}-`;
    const baseSuffix = this.generateRandomSuffix();
    const codes: string[] = [];

    for (
      let offset = 0;
      offset < MAX_BATCH_COLLISION_ATTEMPTS && codes.length < count;
      offset += 1
    ) {
      const code = `${prefix}${incrementSuffix(baseSuffix, offset)}`;
      const existing = await this.findByProductCode(code, tx);
      if (!existing) codes.push(code);
    }

    if (codes.length !== count) {
      throw new BadRequestError(
        'Could not generate the requested product code batch',
      );
    }

    return codes;
  }

  private findByProductCode(code: string, tx?: Prisma.TransactionClient) {
    return tx
      ? this.productsRepository.findByProductCode(code, tx)
      : this.productsRepository.findByProductCode(code);
  }

  private generateRandomSuffix() {
    return Array.from({ length: PRODUCT_CODE_SUFFIX_LENGTH }, () =>
      PRODUCT_CODE_ALPHABET.charAt(
        Math.floor(Math.random() * PRODUCT_CODE_ALPHABET.length),
      ),
    ).join('');
  }
}

function incrementSuffix(suffix: string, offset: number) {
  const digits = [...suffix].map((character) =>
    PRODUCT_CODE_ALPHABET.indexOf(character),
  );
  let carry = offset;

  for (let index = digits.length - 1; index >= 0 && carry > 0; index -= 1) {
    const value = digits[index] + carry;
    digits[index] = value % PRODUCT_CODE_ALPHABET.length;
    carry = Math.floor(value / PRODUCT_CODE_ALPHABET.length);
  }

  return digits.map((digit) => PRODUCT_CODE_ALPHABET.charAt(digit)).join('');
}
