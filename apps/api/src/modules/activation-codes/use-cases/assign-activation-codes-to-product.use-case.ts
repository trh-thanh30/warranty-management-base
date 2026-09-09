import { BadRequestError, NotFoundError } from '@/common/response';
import {
  ActivationCodeBatchesRepository,
  ProductActivationCodeAssignmentConflictError,
} from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status, Prisma, product_status } from '@prisma/client';
import {
  MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
  type ActivationCodeProductAssignmentMode,
} from '@repo/shared/constants';

type AssignActivationCodesToProductInput = {
  activationCodeIds?: string[];
  assignmentMode?: ActivationCodeProductAssignmentMode;
  batchId?: string;
  from?: number;
  productId: string;
  to?: number;
};

@Injectable()
export class AssignActivationCodesToProductUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(input: AssignActivationCodesToProductInput) {
    const activationCodeIds = [...new Set(input.activationCodeIds ?? [])];
    const assignmentMode = input.assignmentMode ?? 'SELECTED';
    if (
      assignmentMode === 'SELECTED' &&
      (activationCodeIds.length === 0 ||
        activationCodeIds.length !== input.activationCodeIds?.length)
    ) {
      throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT');
    }
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
    if (assignmentMode !== 'SELECTED') {
      if (!input.batchId) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_BATCH_REQUIRED');
      }
      const range =
        assignmentMode === 'RANGE'
          ? this.validateRange(input.from, input.to)
          : undefined;
      const result = await this.assignByBatch({
        batchId: input.batchId,
        productId: product.id,
        now,
        ...range,
      });
      if (!result) {
        throw new NotFoundError(
          'Activation code batch',
          'ACTIVATION_CODE_BATCH_NOT_FOUND',
        );
      }
      if (result.count === 0) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_EMPTY');
      }
      return this.result(result.activationCodeIds, product);
    }

    const codes =
      await this.repository.findCodesForAssignment(activationCodeIds);
    if (codes.length !== activationCodeIds.length) {
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

    const result = await this.assign(activationCodeIds, product.id, now);
    if (result.count !== activationCodeIds.length) {
      throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT');
    }

    return this.result(activationCodeIds, product);
  }

  private validateRange(from?: number, to?: number) {
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from === undefined ||
      to === undefined ||
      from < 1 ||
      to < from ||
      to > MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT
    ) {
      throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_RANGE_INVALID');
    }
    return { from, to };
  }

  private result(
    activationCodeIds: string[],
    product: {
      id: string;
      product_code: string;
      display_name: string | null;
    },
  ) {
    return {
      activationCodeIds,
      product: {
        id: product.id,
        productCode: product.product_code,
        displayName: product.display_name,
        name: product.display_name ?? product.product_code,
      },
    };
  }

  private async assign(
    activationCodeIds: string[],
    productId: string,
    now: Date,
  ) {
    try {
      return await this.repository.assignProduct(
        activationCodeIds,
        productId,
        now,
      );
    } catch (error) {
      if (error instanceof ProductActivationCodeAssignmentConflictError) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT', {
          productId,
        });
      }
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

  private async assignByBatch(input: {
    batchId: string;
    productId: string;
    now: Date;
    from?: number;
    to?: number;
  }) {
    try {
      return await this.repository.assignProductByBatch(input);
    } catch (error) {
      if (
        error instanceof ProductActivationCodeAssignmentConflictError ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002')
      ) {
        throw this.invalid('ACTIVATION_CODE_ASSIGNMENT_CONFLICT', {
          productId: input.productId,
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
