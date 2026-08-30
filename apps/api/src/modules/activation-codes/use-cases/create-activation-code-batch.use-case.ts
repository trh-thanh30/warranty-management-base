import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { GenerateActivationCodeUseCase } from '@/modules/activation-codes/use-cases/generate-activation-code.use-case';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status } from '@prisma/client';
import { randomBytes } from 'node:crypto';

const EXPIRY_MONTHS = 6;
const CREATE_ATTEMPTS = 3;
const MIN_BATCH_QUANTITY = 50;
const MAX_BATCH_QUANTITY = 1000;

@Injectable()
export class CreateActivationCodeBatchUseCase {
  constructor(
    private readonly batchesRepository: ActivationCodeBatchesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly generateActivationCodeUseCase: GenerateActivationCodeUseCase,
    private readonly cryptoService: ActivationCodeCryptoService,
  ) {}

  async execute(input: {
    sourceProductId: string;
    quantity: number;
    createdById: string;
  }) {
    if (
      !Number.isInteger(input.quantity) ||
      input.quantity < MIN_BATCH_QUANTITY ||
      input.quantity > MAX_BATCH_QUANTITY
    ) {
      throw new BadRequestError(
        'Activation code batch quantity must be between 50 and 1000',
        'ACTIVATION_CODE_BATCH_QUANTITY_INVALID',
      );
    }

    const product = await this.productsRepository.findById(
      input.sourceProductId,
    );
    if (!product || product.deleted_at) {
      throw new NotFoundError('Product', 'PRODUCT_NOT_FOUND');
    }
    if (product.status !== product_status.ACTIVE) {
      throw new BadRequestError(
        'Only active products can be used to generate activation codes',
        'ACTIVATION_CODE_PRODUCT_INACTIVE',
      );
    }
    if (!product.warranty || product.warranty.duration_months <= 0) {
      throw new BadRequestError(
        'Product must have a valid warranty configuration',
        'ACTIVATION_CODE_WARRANTY_REQUIRED',
      );
    }

    const now = new Date();
    const expiresAt = addCalendarMonthsUtc(now, EXPIRY_MONTHS);

    for (let attempt = 1; attempt <= CREATE_ATTEMPTS; attempt += 1) {
      const plaintextCodes = this.generateActivationCodeUseCase.executeBatch(
        input.quantity,
      );
      const batchCode = this.generateBatchCode(now);

      try {
        const batch = await this.batchesRepository.create({
          batchCode,
          sourceProductId: product.id,
          productSku: product.product_code,
          productName: product.display_name?.trim() || product.product_code,
          brand: product.brand,
          model: product.model,
          modelYear: product.model_year,
          warrantyDurationMonths: product.warranty.duration_months,
          warrantyMethod: product.warranty.method,
          warrantyTerms: product.warranty.terms,
          quantity: input.quantity,
          expiresAt,
          createdById: input.createdById,
          codes: plaintextCodes.map((code) => ({
            codeHash: this.cryptoService.hash(code),
            codeCiphertext: this.cryptoService.encrypt(code),
          })),
        });

        return {
          id: batch.id,
          batchCode: batch.batch_code,
          sourceProductId: batch.source_product_id,
          product: {
            sku: batch.product_sku,
            name: batch.product_name,
            brand: batch.brand,
            model: batch.model,
            modelYear: batch.model_year,
          },
          warranty: {
            durationMonths: batch.warranty_duration_months,
            method: batch.warranty_method,
            terms: batch.warranty_terms,
          },
          quantity: batch.quantity,
          expiresAt: batch.expires_at,
          createdAt: batch.created_at,
          codes: plaintextCodes,
        };
      } catch (error) {
        if (!this.isUniqueConflict(error) || attempt === CREATE_ATTEMPTS) {
          throw error;
        }
      }
    }

    throw new Error('Activation code batch generation exhausted');
  }

  private generateBatchCode(now: Date): string {
    const date = now.toISOString().slice(0, 10).replaceAll('-', '');
    return `ACB-${date}-${randomBytes(5).toString('hex').toUpperCase()}`;
  }

  private isUniqueConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}

export function addCalendarMonthsUtc(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}
