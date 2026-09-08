import 'reflect-metadata';

import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Service center DTO validation', () => {
  it('accepts all as the active list filter', async () => {
    const dto = plainToInstance(ListServiceCentersDto, { isActive: 'all' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects non-phone text in the phone field', async () => {
    const dto = plainToInstance(CreateServiceCenterDto, {
      name: 'Da Nang Warranty Center',
      phone: 'danangservice@examplecom',
      province: 'Da Nang',
      address: '789 Nguyen Van Linh',
      latitude: 16.0544,
      longitude: 108.2022,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'phone')).toBe(true);
  });

  it('accepts a commonly formatted phone number', async () => {
    const dto = plainToInstance(CreateServiceCenterDto, {
      name: 'Da Nang Warranty Center',
      phone: '+84 (90) 123-4567',
      province: 'Da Nang',
      address: '789 Nguyen Van Linh',
      latitude: 16.0544,
      longitude: 108.2022,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows coordinates to be omitted when creating a service center', async () => {
    const dto = plainToInstance(CreateServiceCenterDto, {
      name: 'Da Nang Warranty Center',
      province: 'Da Nang',
      address: '789 Nguyen Van Linh',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
