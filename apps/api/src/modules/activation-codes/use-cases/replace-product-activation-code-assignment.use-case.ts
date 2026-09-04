import { BadRequestError, NotFoundError } from '@/common/response';
import {
  ActivationCodeBatchesRepository,
  ProductActivationCodeReplacementConflictError,
} from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status, product_status } from '@prisma/client';

type ReplaceProductActivationCodeAssignmentInput = {
  currentActivationCodeId: string;
  replacementActivationCodeId: string;
  productId: string;
};

@Injectable()
export class ReplaceProductActivationCodeAssignmentUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(input: ReplaceProductActivationCodeAssignmentInput) {
    if (input.currentActivationCodeId === input.replacementActivationCodeId) {
      throw this.invalid('ACTIVATION_CODE_REPLACEMENT_MUST_BE_DIFFERENT');
    }

    const product = await this.repository.findAssignmentProduct(
      input.productId,
    );
    if (!product) throw new NotFoundError('Product not found');
    if (product.deleted_at || product.status !== product_status.ACTIVE) {
      throw this.invalid('ACTIVATION_CODE_ASSIGN_PRODUCT_INACTIVE');
    }
    if (product.category_ref.activation_code_enabled === false) {
      throw this.invalid('ACTIVATION_CODE_NOT_APPLICABLE');
    }
    if ((product.warranty_duration_months ?? 0) <= 0) {
      throw this.invalid('PRODUCT_WARRANTY_POLICY_MISSING');
    }

    const now = new Date();
    const codes = await this.repository.findCodesForAssignment([
      input.currentActivationCodeId,
      input.replacementActivationCodeId,
    ]);
    const currentCode = codes.find(
      (code) => code.id === input.currentActivationCodeId,
    );
    const replacementCode = codes.find(
      (code) => code.id === input.replacementActivationCodeId,
    );
    if (!currentCode || !replacementCode) {
      throw new NotFoundError('Activation code not found');
    }
    if (currentCode.product_id !== product.id) {
      throw this.invalid('PRODUCT_ACTIVATION_CODE_MISMATCH');
    }
    if (!this.isUnusedAndValid(currentCode, now)) {
      throw this.invalid('CURRENT_ACTIVATION_CODE_NOT_REPLACEABLE');
    }
    if (
      replacementCode.product_id !== null ||
      !this.isUnusedAndValid(replacementCode, now)
    ) {
      throw this.invalid('REPLACEMENT_ACTIVATION_CODE_NOT_ASSIGNABLE');
    }

    try {
      await this.repository.replaceProductAssignment({ ...input, now });
    } catch (error) {
      if (error instanceof ProductActivationCodeReplacementConflictError) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT');
      }
      throw error;
    }

    return {
      previousActivationCodeId: currentCode.id,
      activationCodeId: replacementCode.id,
      product: {
        id: product.id,
        productCode: product.product_code,
        displayName: product.display_name,
        name: product.display_name ?? product.product_code,
        serialNumber: product.serial_number,
      },
    };
  }

  private isUnusedAndValid(
    code: {
      status: activation_code_status;
      expires_at: Date;
      request: { id: string } | null;
      request_items: Array<{ id: string }>;
      warranty: { id: string } | null;
    },
    now: Date,
  ) {
    return (
      code.status === activation_code_status.AVAILABLE &&
      code.expires_at > now &&
      !code.request &&
      code.request_items.length === 0 &&
      !code.warranty
    );
  }

  private invalid(code: string) {
    return new BadRequestError('Activation code replacement is invalid', code, {
      code,
    });
  }
}
