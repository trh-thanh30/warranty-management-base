import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '@/modules/customers/dto/update-customer.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Customer birthdate DTO validation', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-20T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('accepts a valid birthdate', async () => {
    const errors = await validate(
      plainToInstance(CreateCustomerDto, {
        address: 'Ho Chi Minh City',
        birthdate: '2005-12-11',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0901234567',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects a future birthdate', async () => {
    const errors = await validate(
      plainToInstance(CreateCustomerDto, {
        address: 'Ho Chi Minh City',
        birthdate: '2026-08-21',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0901234567',
      }),
    );

    expect(errors.some((error) => error.property === 'birthdate')).toBe(true);
  });

  it('allows an update to clear the birthdate', async () => {
    const errors = await validate(
      plainToInstance(UpdateCustomerDto, { birthdate: null }),
    );

    expect(errors).toHaveLength(0);
  });
});
