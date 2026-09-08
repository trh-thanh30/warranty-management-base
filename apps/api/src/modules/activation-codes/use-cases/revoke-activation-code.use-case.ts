import { BadRequestError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RevokeActivationCodeUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(id: string) {
    const result = await this.repository.revoke(id);
    if (result.count === 1) return { id, status: 'REVOKED' as const };

    throw new BadRequestError(
      'Only an available activation code can be revoked',
      'ACTIVATION_CODE_NOT_REVOCABLE',
    );
  }
}
