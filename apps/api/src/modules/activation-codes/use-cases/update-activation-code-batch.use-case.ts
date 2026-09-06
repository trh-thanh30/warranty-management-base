import { NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateActivationCodeBatchUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(id: string, batchName: string) {
    const name = batchName.trim();
    const result = await this.repository.updateBatchName(id, name);
    if (!result) throw new NotFoundError('Activation code batch');
    return {
      id: result.id,
      batchCode: result.batch_code,
      batchName: result.batch_name,
    };
  }
}
