import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReplaceActivationCodeUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(id: string, replacementCode: string) {
    const result = await this.repository.replaceExpiredCode(
      id,
      replacementCode,
    );
    if (result.kind === 'NOT_FOUND') throw new NotFoundError('Activation code');
    if (result.kind === 'NOT_REPLACEABLE') {
      throw new BadRequestError(
        'Only an expired activation code can be replaced',
        'ACTIVATION_CODE_NOT_REPLACEABLE',
      );
    }
    if (result.kind === 'INVALID_REPLACEMENT') {
      throw new BadRequestError(
        'Replacement code must be available for the same product',
        'ACTIVATION_CODE_REPLACEMENT_INVALID',
      );
    }
    return {
      id,
      replacementId: result.replacementId,
      status: 'REPLACED' as const,
    };
  }
}
