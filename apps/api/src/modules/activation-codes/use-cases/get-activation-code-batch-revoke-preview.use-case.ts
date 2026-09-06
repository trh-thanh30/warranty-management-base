import { NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetActivationCodeBatchRevokePreviewUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(batchId: string) {
    const result = await this.repository.getRevokePreview(batchId);
    if (!result) throw new NotFoundError('Activation code batch');
    return result;
  }
}
