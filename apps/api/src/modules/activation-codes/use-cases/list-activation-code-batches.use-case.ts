import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListActivationCodeBatchesUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  execute(query: Parameters<ActivationCodeBatchesRepository['list']>[0]) {
    return this.repository.list(query);
  }
}
