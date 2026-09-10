import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExtendActivationCodeBatchExpiryUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(batchId: string, months: number) {
    const result = await this.repository.extendBatchExpiry({
      batchId,
      months,
      now: new Date(),
    });

    switch (result.kind) {
      case 'NOT_FOUND':
        throw new NotFoundError('Activation code batch');
      case 'EXPIRED_BATCH':
        throw new BadRequestError(
          'Expired activation code batches cannot be extended',
          'ACTIVATION_CODE_BATCH_EXTENSION_EXPIRED',
        );
      case 'CONFLICT':
        throw new ConflictError(
          'Activation code batch changed while extending its expiry',
          'ACTIVATION_CODE_BATCH_EXTENSION_CONFLICT',
        );
      case 'NO_ELIGIBLE_CODES':
      case 'EXTENDED':
        return {
          batchId,
          previousExpiresAt: result.previousExpiresAt.toISOString(),
          expiresAt: result.expiresAt.toISOString(),
          extendedCount: result.extendedCount,
          skipped: result.skipped,
        };
    }
  }
}
