import 'reflect-metadata';

import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateAdminWarrantyActivationRequestDto', () => {
  const base = {
    addressDetail: '1 Nguyen Trai',
    categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
  };

  it('accepts nested physical Product items', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      items: [
        {
          activationFieldId: '33233bad-0bd8-461d-910f-1e3f5ac4d37d',
          positionKey: 'windshield',
          productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
        },
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid Product id inside items', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      items: [
        {
          positionKey: 'windshield',
          productId: 'SP50',
        },
      ],
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
