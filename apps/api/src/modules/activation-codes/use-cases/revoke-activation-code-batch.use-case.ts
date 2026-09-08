import { NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import type { ActivationCodeBatchRevokeScope } from '@repo/shared';
import { DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE } from '@repo/shared/constants';

@Injectable()
export class RevokeActivationCodeBatchUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(
    batchId: string,
    scope: ActivationCodeBatchRevokeScope = DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE,
  ) {
    const result = await this.repository.revokeBatch(batchId, scope);
    if (!result) throw new NotFoundError('Activation code batch');
    return result;
  }
}
