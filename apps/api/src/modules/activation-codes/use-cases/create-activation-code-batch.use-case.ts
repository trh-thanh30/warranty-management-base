import { BadRequestError, NotFoundError } from '@/common/response';
import { activationCodeConfig } from '@/config';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { GenerateActivationCodeUseCase } from '@/modules/activation-codes/use-cases/generate-activation-code.use-case';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { addCalendarMonthsUtc } from '@/modules/activation-codes/utils/date.utils';
import { Prisma, product_status } from '@prisma/client';
import { randomBytes } from 'node:crypto';

@Injectable()
export class CreateActivationCodeBatchUseCase {
  constructor(
    private readonly batchesRepository: ActivationCodeBatchesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly generateActivationCodeUseCase: GenerateActivationCodeUseCase,
    private readonly cryptoService: ActivationCodeCryptoService,
    @Inject(activationCodeConfig.KEY)
    private readonly config: ConfigType<typeof activationCodeConfig>,
    private readonly policyService: ActivationCodePolicyService,
  ) {}

  async execute(input: {
    sourceProductId?: string;
    quantity?: number;
    createdById: string;
  }) {
    const policy = await this.policyService.get();
    const minBatchQuantity = this.config.minBatchQuantity;
    const maxBatchQuantity = this.config.maxBatchQuantity;
    const quantity = input.quantity ?? policy.defaultBatchQuantity;
    if (
      !Number.isInteger(quantity) ||
      quantity < minBatchQuantity ||
      quantity > maxBatchQuantity
    ) {
      throw new BadRequestError(
        'Activation code batch quantity must be between 50 and 1000',
        'ACTIVATION_CODE_BATCH_QUANTITY_INVALID',
      );
    }

    const product = input.sourceProductId
      ? await this.productsRepository.findById(input.sourceProductId)
      : null;
    if (input.sourceProductId && (!product || product.deleted_at)) {
      throw new NotFoundError('Product', 'PRODUCT_NOT_FOUND');
    }
    if (product && product.status !== product_status.ACTIVE) {
      throw new BadRequestError(
        'Only active products can be used to generate activation codes',
        'ACTIVATION_CODE_PRODUCT_INACTIVE',
      );
    }
    if (product && !product.warranty && !product.warranty_duration_months) {
      throw new BadRequestError(
        'Product must have a valid warranty configuration',
        'ACTIVATION_CODE_WARRANTY_REQUIRED',
      );
    }

    const now = new Date();
    const expiresAt = addCalendarMonthsUtc(now, policy.expiryMonths);
    const createAttempts = this.config.createAttempts;

    for (let attempt = 1; attempt <= createAttempts; attempt += 1) {
      const plaintextCodes =
        this.generateActivationCodeUseCase.executeBatch(quantity);
      const batchCode = this.generateBatchCode(now);

      try {
        const batch = await this.batchesRepository.create({
          batchCode,
          sourceProductId: product?.id,
          productSku: product?.product_code,
          productName: product?.display_name?.trim() || product?.product_code,
          brand: product?.brand ?? null,
          model: product?.model ?? null,
          modelYear: product?.model_year ?? null,
          warrantyDurationMonths:
            product?.warranty?.duration_months ??
            product?.warranty_duration_months ??
            undefined,
          warrantyMethod:
            product?.warranty?.method ?? product?.warranty_method ?? undefined,
          warrantyTerms:
            product?.warranty?.terms ?? product?.warranty_terms ?? null,
          quantity,
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
        if (!this.isUniqueConflict(error) || attempt === createAttempts) {
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
