import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status, Prisma, product_status } from '@prisma/client';

@Injectable()
export class AssignActivationCodesToProductUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(input: { activationCodeId: string; productId: string }) {
    const product = await this.repository.findAssignmentProduct(
      input.productId,
    );
    if (!product) throw new NotFoundError('Product', 'PRODUCT_NOT_FOUND');
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
      input.activationCodeId,
    ]);
    if (codes.length !== 1) {
      throw new NotFoundError('Activation code', 'ACTIVATION_CODE_NOT_FOUND');
    }
    for (const code of codes) {
      if (
        code.status !== activation_code_status.AVAILABLE ||
        code.expires_at <= now ||
        code.product_id ||
        code.request ||
        code.request_items.length > 0 ||
        code.warranty
      ) {
        throw this.invalid('ACTIVATION_CODE_NOT_ASSIGNABLE', {
          activationCodeId: code.id,
        });
      }
    }

    const result = await this.assign(input.activationCodeId, product.id, now);
    if (result.count !== 1) {
      throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT');
    }

    return {
      activationCodeId: input.activationCodeId,
      product: {
        id: product.id,
        productCode: product.product_code,
        displayName: product.display_name,
        name: product.display_name ?? product.product_code,
      },
    };
  }

  private async assign(activationCodeId: string, productId: string, now: Date) {
    try {
      return await this.repository.assignProduct(
        [activationCodeId],
        productId,
        now,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT', {
          productId,
        });
      }
      throw error;
    }
  }

  private invalid(code: string, details?: Record<string, unknown>) {
    return new BadRequestError('Activation code assignment is invalid', code, {
      code,
      ...details,
    });
  }
}
