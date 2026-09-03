import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListAvailableActivationCodesUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  execute(
    productId: string | undefined,
    filters: { page?: number; limit?: number; search?: string },
  ) {
    return this.repository.listAvailableByProduct(productId, filters);
  }
}
