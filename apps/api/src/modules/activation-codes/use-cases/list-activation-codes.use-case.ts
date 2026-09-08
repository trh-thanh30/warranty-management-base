import { NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status } from '@prisma/client';

@Injectable()
export class ListActivationCodesUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  execute(
    batchId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: activation_code_status;
    },
  ) {
    return this.repository.listCodes(batchId, filters).then((result) => {
      if (!result) throw new NotFoundError('Activation code batch not found');
      return result;
    });
  }

  executeByProduct(
    productId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: activation_code_status;
    },
  ) {
    return this.repository
      .listCodes(productId, filters, 'product')
      .then((result) => {
        if (!result) throw new NotFoundError('Product not found');
        return result;
      });
  }
}
