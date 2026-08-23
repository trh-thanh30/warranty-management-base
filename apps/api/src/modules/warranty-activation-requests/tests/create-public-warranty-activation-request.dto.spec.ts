import 'reflect-metadata';

import { CreatePublicWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-public-warranty-activation-request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreatePublicWarrantyActivationRequestDto', () => {
  it('does not accept the Admin-only customer birthdate field', async () => {
    const dto = plainToInstance(CreatePublicWarrantyActivationRequestDto, {
      addressDetail: '1 Nguyen Trai',
      customerBirthdate: '2005-12-11',
      customerEmail: 'customer@example.com',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    const errors = await validate(dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors.some((error) => error.property === 'customerBirthdate')).toBe(
      true,
    );
  });
});
