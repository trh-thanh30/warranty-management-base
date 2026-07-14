import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Service center DTO validation', () => {
  it('rejects non-phone text in the phone field', async () => {
    const dto = plainToInstance(CreateServiceCenterDto, {
      name: 'Da Nang Warranty Center',
      phone: 'danangservice@examplecom',
      province: 'Da Nang',
      address: '789 Nguyen Van Linh',
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
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
