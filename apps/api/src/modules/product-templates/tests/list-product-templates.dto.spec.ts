import 'reflect-metadata';

import { ListProductTemplatesDto } from '@/modules/product-templates/dto/list-product-templates.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ListProductTemplatesDto', () => {
  it('accepts isActive=all', async () => {
    const dto = plainToInstance(ListProductTemplatesDto, { isActive: 'all' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported active filter', async () => {
    const dto = plainToInstance(ListProductTemplatesDto, { isActive: 'yes' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
