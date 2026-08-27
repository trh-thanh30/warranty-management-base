import 'reflect-metadata';

import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
import { UpdateDealerDto } from '@/modules/dealers/dto/update-dealer.dto';
import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const validDealer = {
  name: 'Ha Noi Dealer',
  province: 'Ha Noi',
  address: '1 Nguyen Trai',
  latitude: 21.0285,
  longitude: 105.8542,
};

describe('Dealer DTO validation', () => {
  it('accepts all as the active list filter', async () => {
    const dto = plainToInstance(ListDealersDto, { isActive: 'all' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('requires coordinates when creating a dealer', async () => {
    const dto = plainToInstance(CreateDealerDto, {
      name: validDealer.name,
      province: validDealer.province,
      address: validDealer.address,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['latitude', 'longitude']),
    );
  });

  it('rejects coordinates outside their valid ranges', async () => {
    const dto = plainToInstance(CreateDealerDto, {
      ...validDealer,
      latitude: 91,
      longitude: -181,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['latitude', 'longitude']),
    );
  });

  it('requires both coordinates when updating a location', async () => {
    const dto = plainToInstance(UpdateDealerDto, { latitude: 21.0285 });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'longitude')).toBe(true);
  });
});
