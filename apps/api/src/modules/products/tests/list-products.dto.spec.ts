import 'reflect-metadata';

import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ListProductsDto', () => {
  it.each(['true', 'false'])('accepts activationEligible=%s', async (value) => {
    const dto = plainToInstance(ListProductsDto, {
      activationEligible: value,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a non-boolean activationEligible filter', async () => {
    const dto = plainToInstance(ListProductsDto, {
      activationEligible: 'yes',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
