import { AssignActivationCodesToProductDto } from '@/modules/activation-codes/dto/assign-activation-codes-to-product.dto';
import { validate } from 'class-validator';

describe('AssignActivationCodesToProductDto', () => {
  const productId = '10000000-0000-4000-8000-000000000001';
  const batchId = '10000000-0000-4000-8000-000000000002';

  it.each([
    {
      activationCodeIds: ['10000000-0000-4000-8000-000000000003'],
      assignmentMode: 'SELECTED',
      productId,
    },
    { assignmentMode: 'ALL_AVAILABLE', batchId, productId },
    {
      assignmentMode: 'QUANTITY',
      batchIds: [batchId],
      productId,
      quantity: 20,
    },
  ])('accepts assignment payload %#', async (input) => {
    const dto = Object.assign(new AssignActivationCodesToProductDto(), input);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('requires a valid bounded quantity for automatic quantity assignment', async () => {
    const dto = Object.assign(new AssignActivationCodesToProductDto(), {
      assignmentMode: 'QUANTITY',
      batchIds: [batchId],
      productId,
      quantity: 1001,
    });
    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
