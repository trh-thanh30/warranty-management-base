import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

type ExpireActivationCodesInput = {
  batchSize: number;
  now?: Date;
};

@Injectable()
export class ExpireActivationCodesUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(input: ExpireActivationCodesInput) {
    const now = input.now ?? new Date();
    let batches = 0;
    let expired = 0;

    while (true) {
      const ids = await this.repository.findExpiredAvailableIds(
        now,
        input.batchSize,
      );
      if (ids.length === 0) break;

      const result = await this.repository.expireAvailableIds(ids, now);
      batches += 1;
      expired += result.count;

      if (ids.length < input.batchSize) break;
    }

    return { batches, expired };
  }
}
