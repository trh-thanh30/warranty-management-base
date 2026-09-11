import 'reflect-metadata';

import { CreatePublicWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-public-warranty-activation-request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreatePublicWarrantyActivationRequestDto', () => {
  const base = {
    customerEmail: 'customer@example.com',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    installedAt: '2026-07-08T03:10:00.000Z',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
  };

  it('does not accept the Admin-only customer birthdate field', async () => {
    const dto = plainToInstance(CreatePublicWarrantyActivationRequestDto, {
      addressDetail: '1 Nguyen Trai',
      customerBirthdate: '2005-12-11',
      ...base,
    });

    const errors = await validate(dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors.some((error) => error.property === 'customerBirthdate')).toBe(
      true,
    );
  });

  it('continues to require address detail from public customers', async () => {
    const dto = plainToInstance(CreatePublicWarrantyActivationRequestDto, {
      ...base,
      addressDetail: '',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'addressDetail')).toBe(
      true,
    );
  });

  it.each([
    '123 Nguyễn Trãi, Phường 1',
    'Khu phố Hoàng Xá, Xã A, Tỉnh B',
    'Số 10, Thành phố Tây Hồ',
    '123 Nguyen Trai, Phuong 1',
  ])(
    'accepts a previously valid public address detail: %s',
    async (addressDetail) => {
      const dto = plainToInstance(CreatePublicWarrantyActivationRequestDto, {
        addressDetail,
        ...base,
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );
});
