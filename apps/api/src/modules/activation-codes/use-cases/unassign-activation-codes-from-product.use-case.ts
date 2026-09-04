import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status } from '@prisma/client';

@Injectable()
export class UnassignActivationCodesFromProductUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(input: { activationCodeId: string }) {
    const now = new Date();
    const codes = await this.repository.findCodesForAssignment([
      input.activationCodeId,
    ]);
    if (codes.length !== 1) {
      throw new NotFoundError('Activation code not found');
    }
    for (const code of codes) {
      if (
        code.status !== activation_code_status.AVAILABLE ||
        code.expires_at <= now ||
        !code.product_id ||
        code.request ||
        code.request_items.length > 0 ||
        code.warranty
      ) {
        throw new BadRequestError(
          'Activation code assignment cannot be removed',
          'ACTIVATION_CODE_NOT_UNASSIGNABLE',
          { activationCodeId: code.id },
        );
      }
    }

    const result = await this.repository.unassignProduct(
      [input.activationCodeId],
      now,
    );
    if (result.count !== 1) {
      throw new BadRequestError(
        'Activation code assignment changed concurrently',
        'ACTIVATION_CODE_ASSIGNMENT_CONFLICT',
      );
    }
    return { activationCodeId: input.activationCodeId };
  }
}
