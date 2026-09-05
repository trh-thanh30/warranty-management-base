import { UnassignActivationCodesFromProductUseCase } from '@/modules/activation-codes/use-cases/unassign-activation-codes-from-product.use-case';
import { activation_code_status } from '@prisma/client';

describe('UnassignActivationCodesFromProductUseCase', () => {
  it('removes an unused assignment', async () => {
    const repository = {
      findCodesForAssignment: jest.fn().mockResolvedValue([
        {
          id: 'code-id',
          status: activation_code_status.AVAILABLE,
          expires_at: new Date(Date.now() + 60_000),
          product_id: 'product-id',
          request: null,
          request_items: [],
          warranty: null,
        },
      ]),
      unassignProduct: jest.fn().mockResolvedValue({ count: 1 }),
    };

    const result = await new UnassignActivationCodesFromProductUseCase(
      repository as never,
    ).execute({ activationCodeId: 'code-id' });

    expect(result.activationCodeId).toBe('code-id');
  });
});
