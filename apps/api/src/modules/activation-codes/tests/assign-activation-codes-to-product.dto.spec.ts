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
    { assignmentMode: 'RANGE', batchId, from: 2, productId, to: 20 },
  ])('accepts assignment payload %#', async (input) => {
    const dto = Object.assign(new AssignActivationCodesToProductDto(), input);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('requires a valid bounded range for range assignment', async () => {
    const dto = Object.assign(new AssignActivationCodesToProductDto(), {
      assignmentMode: 'RANGE',
      batchId,
      from: 0,
      productId,
      to: 1001,
    });
    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
