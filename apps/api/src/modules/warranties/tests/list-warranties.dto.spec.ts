import 'reflect-metadata';

import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ListWarrantiesDto', () => {
  it('accepts status=ALL', async () => {
    const dto = plainToInstance(ListWarrantiesDto, { status: 'ALL' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported status', async () => {
    const dto = plainToInstance(ListWarrantiesDto, { status: 'UNKNOWN' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
