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

  it('assigns multiple available codes to an eligible product in one request', async () => {
    const secondCode = { ...code, id: 'second-code-id' };
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest.fn().mockResolvedValue([code, secondCode]),
      assignProduct: jest.fn().mockResolvedValue({ count: 2 }),
    };

    const result = await new AssignActivationCodesToProductUseCase(
      repository as never,
    ).execute({
      activationCodeIds: ['code-id', 'second-code-id'],
      productId: 'product-id',
    });

    expect(result.activationCodeIds).toEqual(['code-id', 'second-code-id']);
    expect(result.product.productCode).toBe('PRD-01');
    expect(repository.assignProduct).toHaveBeenCalledWith(
      ['code-id', 'second-code-id'],
      'product-id',
      expect.any(Date),
    );
  });

  it('assigns every currently assignable code from one batch', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      assignProductByBatch: jest.fn().mockResolvedValue({
        activationCodeIds: ['first-code-id', 'second-code-id'],
        count: 2,
      }),
    };

    const result = await new AssignActivationCodesToProductUseCase(
      repository as never,
    ).execute({
      assignmentMode: 'ALL_AVAILABLE',
      batchId: 'batch-id',
      productId: 'product-id',
    });

    expect(result.activationCodeIds).toEqual([
      'first-code-id',
      'second-code-id',
    ]);
    expect(repository.assignProductByBatch).toHaveBeenCalledWith({
      batchId: 'batch-id',
      productId: 'product-id',
      now: expect.any(Date),
    });
  });

  it('assigns an inclusive range of assignable codes from one batch', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      assignProductByBatch: jest.fn().mockResolvedValue({
        activationCodeIds: ['third-code-id', 'fourth-code-id'],
        count: 2,
      }),
    };

    await new AssignActivationCodesToProductUseCase(
      repository as never,
    ).execute({
      assignmentMode: 'RANGE',
      batchId: 'batch-id',
      from: 3,
      productId: 'product-id',
      to: 4,
    });

    expect(repository.assignProductByBatch).toHaveBeenCalledWith({
      batchId: 'batch-id',
      from: 3,
      productId: 'product-id',
      now: expect.any(Date),
      to: 4,
    });
  });

  it('rejects an invalid automatic assignment range', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      assignProductByBatch: jest.fn(),
    };

    await expect(
      new AssignActivationCodesToProductUseCase(repository as never).execute({
        assignmentMode: 'RANGE',
        batchId: 'batch-id',
        from: 10,
        productId: 'product-id',
        to: 2,
      }),
    ).rejects.toMatchObject({
      code: 'ACTIVATION_CODE_ASSIGNMENT_RANGE_INVALID',
    });
    expect(repository.assignProductByBatch).not.toHaveBeenCalled();
  });

  it('returns stable not-found codes for assignment feedback', async () => {
    await expect(
      new AssignActivationCodesToProductUseCase({
        findAssignmentProduct: jest.fn().mockResolvedValue(null),
      } as never).execute({
        activationCodeIds: ['code-id'],
        productId: 'missing-product-id',
      }),
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });

    await expect(
      new AssignActivationCodesToProductUseCase({
        findAssignmentProduct: jest.fn().mockResolvedValue(product),
        findCodesForAssignment: jest.fn().mockResolvedValue([]),
      } as never).execute({
        activationCodeIds: ['missing-code-id'],
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
        activationCodeIds: ['code-id'],
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
    };

    await expect(
      new AssignActivationCodesToProductUseCase(repository as never).execute({
        activationCodeIds: ['code-id'],
        productId: 'product-id',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_ASSIGNABLE' });
  });

  it('allows assigning a second activation code to the same product', async () => {
    const repository = {
      findAssignmentProduct: jest.fn().mockResolvedValue(product),
      findCodesForAssignment: jest.fn().mockResolvedValue([code]),
      assignProduct: jest.fn().mockResolvedValue({ count: 1 }),
    };

    const result = await new AssignActivationCodesToProductUseCase(
      repository as never,
    ).execute({
      activationCodeIds: ['code-id'],
      productId: 'product-id',
    });

    expect(result.product.id).toBe('product-id');
    expect(repository.assignProduct).toHaveBeenCalled();
  });
});
