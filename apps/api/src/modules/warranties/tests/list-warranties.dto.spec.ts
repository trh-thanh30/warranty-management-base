import 'reflect-metadata';

import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ListWarrantiesDto', () => {
  it.each(['true', 'false'])(
    'accepts claimEligible=%s',
    async (claimEligible) => {
      const dto = plainToInstance(ListWarrantiesDto, { claimEligible });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );

  it('rejects a non-boolean claimEligible filter', async () => {
    const dto = plainToInstance(ListWarrantiesDto, { claimEligible: 'yes' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it.each(['categoryId', 'productId'] as const)(
    'accepts a UUID %s filter',
    async (field) => {
      const dto = plainToInstance(ListWarrantiesDto, {
        [field]: '123e4567-e89b-42d3-a456-426614174000',
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );

  it.each(['categoryId', 'productId'] as const)(
    'rejects an invalid %s filter',
    async (field) => {
      const dto = plainToInstance(ListWarrantiesDto, {
        [field]: 'not-a-uuid',
      });

      await expect(validate(dto)).resolves.not.toHaveLength(0);
    },
  );

  it('accepts status=ALL', async () => {
    const dto = plainToInstance(ListWarrantiesDto, { status: 'ALL' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported status', async () => {
    const dto = plainToInstance(ListWarrantiesDto, { status: 'UNKNOWN' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
