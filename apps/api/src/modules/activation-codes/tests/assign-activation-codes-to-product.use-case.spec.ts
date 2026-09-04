import { AssignActivationCodesToProductUseCase } from '@/modules/activation-codes/use-cases/assign-activation-codes-to-product.use-case';
import { activation_code_status, product_status } from '@prisma/client';

describe('AssignActivationCodesToProductUseCase', () => {
  const product = {
    id: 'product-id',
    product_code: 'PRD-01',
    display_name: 'Camera hành trình',
    name: 'Camera',
    serial_number: null,
    status: product_status.ACTIVE,
    deleted_at: null,
    warranty_duration_months: 24,
    category_ref: { activation_code_enabled: true },
  };
  const code = {
    id: 'code-id',
    status: activation_code_status.AVAILABLE,
    expires_at: new Date(Date.now() + 60_000),
    product_id: null,
    request: null,
    request_items: [],
    warranty: null,
  };

  it('assigns available codes to an eligible product', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest.fn().mockResolvedValue([code]),
      findCodeAssignedToProduct: jest.fn().mockResolvedValue(null),
      assignProduct: jest.fn().mockResolvedValue({ count: 1 }),
    };

    const result = await new AssignActivationCodesToProductUseCase(
      repository as never,
    ).execute({ activationCodeId: 'code-id', productId: 'product-id' });

    expect(result.activationCodeId).toBe('code-id');
    expect(result.product.productCode).toBe('PRD-01');
    expect(repository.assignProduct).toHaveBeenCalledWith(
      ['code-id'],
      'product-id',
      expect.any(Date),
    );
  });

  it('returns stable not-found codes for assignment feedback', async () => {
    await expect(
      new AssignActivationCodesToProductUseCase({
        findAssignmentProduct: jest.fn().mockResolvedValue(null),
      } as never).execute({
        activationCodeId: 'code-id',
        productId: 'missing-product-id',
      }),
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });

    await expect(
      new AssignActivationCodesToProductUseCase({
        findAssignmentProduct: jest.fn().mockResolvedValue(product),
        findCodesForAssignment: jest.fn().mockResolvedValue([]),
      } as never).execute({
        activationCodeId: 'missing-code-id',
        productId: product.id,
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_FOUND' });
  });

  it('rejects a product category that does not use activation codes', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue({
        ...product,
        category_ref: { activation_code_enabled: false },
      }),
    };

    await expect(
      new AssignActivationCodesToProductUseCase(repository as never).execute({
        activationCodeId: 'code-id',
        productId: 'product-id',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_APPLICABLE' });
  });

  it('rejects codes already involved in an activation request', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest
        .fn()
        .mockResolvedValue([{ ...code, request: { id: 'request-id' } }]),
      findCodeAssignedToProduct: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new AssignActivationCodesToProductUseCase(repository as never).execute({
        activationCodeId: 'code-id',
        productId: 'product-id',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_ASSIGNABLE' });
  });

  it('rejects assigning a second activation code to the same product', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest.fn().mockResolvedValue([code]),
      findCodeAssignedToProduct: jest
        .fn()
        .mockResolvedValue({ id: 'existing-code-id' }),
    };

    await expect(
      new AssignActivationCodesToProductUseCase(repository as never).execute({
        activationCodeId: 'code-id',
        productId: 'product-id',
      }),
    ).rejects.toMatchObject({ code: 'PRODUCT_ALREADY_HAS_ACTIVATION_CODE' });
  });
});
