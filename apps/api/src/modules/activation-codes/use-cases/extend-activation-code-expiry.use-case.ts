import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExtendActivationCodeExpiryUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(id: string, months: number) {
    const result = await this.repository.extendCodeExpiry({
      id,
      months,
      now: new Date(),
    });

    switch (result.kind) {
      case 'NOT_FOUND':
        throw new NotFoundError('Activation code');
      case 'EXPIRED':
        throw new BadRequestError(
          'Expired activation codes cannot be extended',
          'ACTIVATION_CODE_EXTENSION_EXPIRED',
        );
      case 'ACTIVATED':
      case 'REVOKED':
        throw new BadRequestError(
          'Activation code status does not allow expiry extension',
          'ACTIVATION_CODE_EXTENSION_STATUS_NOT_ALLOWED',
          { status: result.kind },
        );
      case 'CONFLICT':
        throw new ConflictError(
          'Activation code changed while extending its expiry',
          'ACTIVATION_CODE_EXTENSION_CONFLICT',
        );
      case 'EXTENDED':
        return {
          activationCodeId: id,
          previousExpiresAt: result.previousExpiresAt.toISOString(),
          expiresAt: result.expiresAt.toISOString(),
        };
    }
  }
}
