import { ReplaceProductActivationCodeAssignmentUseCase } from '@/modules/activation-codes/use-cases/replace-product-activation-code-assignment.use-case';
import { activation_code_status, product_status } from '@prisma/client';

describe('ReplaceProductActivationCodeAssignmentUseCase', () => {
  const product = {
    id: 'product-id',
    product_code: 'PRD-01',
    display_name: 'Camera hành trình',
    status: product_status.ACTIVE,
    deleted_at: null,
    warranty_duration_months: 24,
    category_ref: { activation_code_enabled: true },
  };
  const currentCode = {
    id: 'current-code-id',
    status: activation_code_status.AVAILABLE,
    expires_at: new Date(Date.now() + 60_000),
    product_id: product.id,
    request: null,
    request_items: [],
    warranty: null,
  };
  const replacementCode = {
    ...currentCode,
    id: 'replacement-code-id',
    product_id: null,
  };

  it('atomically replaces an unused code assigned to the product', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest
        .fn()
        .mockResolvedValue([currentCode, replacementCode]),
      replaceProductAssignment: jest.fn().mockResolvedValue(undefined),
    };

    const result = await new ReplaceProductActivationCodeAssignmentUseCase(
      repository as never,
    ).execute({
      currentActivationCodeId: currentCode.id,
      replacementActivationCodeId: replacementCode.id,
      productId: product.id,
    });

    expect(repository.replaceProductAssignment).toHaveBeenCalledWith({
      currentActivationCodeId: currentCode.id,
      replacementActivationCodeId: replacementCode.id,
      productId: product.id,
      now: expect.any(Date),
    });
    expect(result).toEqual({
      previousActivationCodeId: currentCode.id,
      activationCodeId: replacementCode.id,
      product: {
        id: product.id,
        productCode: product.product_code,
        displayName: product.display_name,
        name: product.display_name,
      },
    });
  });

  it('rejects replacement when the current code does not belong to the product', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest
        .fn()
        .mockResolvedValue([
          { ...currentCode, product_id: 'other-product-id' },
          replacementCode,
        ]),
    };

    await expect(
      new ReplaceProductActivationCodeAssignmentUseCase(
        repository as never,
      ).execute({
        currentActivationCodeId: currentCode.id,
        replacementActivationCodeId: replacementCode.id,
        productId: product.id,
      }),
    ).rejects.toMatchObject({ code: 'PRODUCT_ACTIVATION_CODE_MISMATCH' });
  });

  it('rejects replacement for a product category that does not use activation codes', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue({
        ...product,
        category_ref: { activation_code_enabled: false },
      }),
      findCodesForAssignment: jest.fn(),
      replaceProductAssignment: jest.fn(),
    };

    await expect(
      new ReplaceProductActivationCodeAssignmentUseCase(
        repository as never,
      ).execute({
        currentActivationCodeId: currentCode.id,
        replacementActivationCodeId: replacementCode.id,
        productId: product.id,
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_APPLICABLE' });
    expect(repository.findCodesForAssignment).not.toHaveBeenCalled();
    expect(repository.replaceProductAssignment).not.toHaveBeenCalled();
  });

  it('rejects replacement after the current code enters an activation request', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest
        .fn()
        .mockResolvedValue([
          { ...currentCode, request: { id: 'request-id' } },
          replacementCode,
        ]),
    };

    await expect(
      new ReplaceProductActivationCodeAssignmentUseCase(
        repository as never,
      ).execute({
        currentActivationCodeId: currentCode.id,
        replacementActivationCodeId: replacementCode.id,
        productId: product.id,
      }),
    ).rejects.toMatchObject({
      code: 'CURRENT_ACTIVATION_CODE_NOT_REPLACEABLE',
    });
  });

  it('does not replace an activated code that issued a warranty', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest.fn().mockResolvedValue([
        {
          ...currentCode,
          status: activation_code_status.ACTIVATED,
          request: { id: 'request-id' },
          request_items: [{ id: 'request-item-id' }],
          warranty: { id: 'warranty-id' },
        },
        replacementCode,
      ]),
      replaceProductAssignment: jest.fn(),
    };

    await expect(
      new ReplaceProductActivationCodeAssignmentUseCase(
        repository as never,
      ).execute({
        currentActivationCodeId: currentCode.id,
        replacementActivationCodeId: replacementCode.id,
        productId: product.id,
      }),
    ).rejects.toMatchObject({
      code: 'CURRENT_ACTIVATION_CODE_NOT_REPLACEABLE',
    });
    expect(repository.replaceProductAssignment).not.toHaveBeenCalled();
  });
});
