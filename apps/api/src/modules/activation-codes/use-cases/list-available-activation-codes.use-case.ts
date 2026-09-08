import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListAvailableActivationCodesUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  execute(
    productId: string | undefined,
    filters: {
      batchId?: string;
      page?: number;
      limit?: number;
      search?: string;
      assignment?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
    },
  ) {
    return this.repository.listAvailableByProduct(productId, filters);
  }
}
