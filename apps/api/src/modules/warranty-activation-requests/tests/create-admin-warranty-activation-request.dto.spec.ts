import 'reflect-metadata';

import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateAdminWarrantyActivationRequestDto', () => {
  const base = {
    addressDetail: '1 Nguyen Trai',
    categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
    customerId: '68a1578a-b13e-45de-b008-e357392be715',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    installedAt: '2026-07-08T03:10:00.000Z',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
  };

  it('requires a selected Customer id', async () => {
    const input = Object.fromEntries(
      Object.entries(base).filter(([key]) => key !== 'customerId'),
    );
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, input);

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'customerId')).toBe(true);
  });

  it('accepts an address made only from the selected ward and province', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      addressDetail: '',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts a selected Customer without address information', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      addressDetail: '',
      provinceCode: '',
      provinceName: '',
      wardCode: '',
      wardName: '',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts the optional Customer profile update flag', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      updateCustomerProfile: true,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a non-boolean Customer profile update flag', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      updateCustomerProfile: 'true',
    });

    const errors = await validate(dto);

    expect(
      errors.some((error) => error.property === 'updateCustomerProfile'),
    ).toBe(true);
  });

  it('rejects a future customer birthdate', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-20T12:00:00.000Z'));

    try {
      const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
        ...base,
        customerBirthdate: '2026-08-21',
      });

      const errors = await validate(dto);

      expect(
        errors.some((error) => error.property === 'customerBirthdate'),
      ).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects null because Admin activation can omit but cannot clear birthdate', async () => {
    const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
      ...base,
      customerBirthdate: null,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'customerBirthdate')).toBe(
      true,
    );
  });

  it.each(['1899-12-31', '2005-02-29', '2005-12-11T00:00:00.000Z'])(
    'rejects an unsupported customer birthdate: %s',
    async (birthdate) => {
      const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
        ...base,
        customerBirthdate: birthdate,
      });

      const errors = await validate(dto);

      expect(
        errors.some((error) => error.property === 'customerBirthdate'),
      ).toBe(true);
    },
  );

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

  it.each([
    'Khu phố Hoàng Xá, Phường A',
    'Khu phố Hoàng Xá, Xã A',
    'Khu phố Hoàng Xá, Tỉnh B',
    'Khu phố Hoàng Xá, Thành phố B',
  ])(
    'rejects structured location text in address detail: %s',
    async (addressDetail) => {
      const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
        ...base,
        addressDetail,
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'addressDetail')).toBe(
        true,
      );
    },
  );

  it.each(['Khu phố Hoàng Xá, Thị xã Thuận Thành', 'Số 10 Tỉnh lộ 282'])(
    'accepts local address detail: %s',
    async (addressDetail) => {
      const dto = plainToInstance(CreateAdminWarrantyActivationRequestDto, {
        ...base,
        addressDetail,
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );
});
