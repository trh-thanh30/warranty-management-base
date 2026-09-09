import { ExtendActivationCodeExpiryDto } from '@/modules/activation-codes/dto/extend-activation-code-expiry.dto';
import { validate } from 'class-validator';

describe('ExtendActivationCodeExpiryDto', () => {
  it.each([1, 12, 120])('accepts %i extension months', async (months) => {
    const dto = Object.assign(new ExtendActivationCodeExpiryDto(), { months });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([undefined, 0, -1, 1.5, 121, '6'])(
    'rejects invalid extension months %#',
    async (months) => {
      const dto = Object.assign(new ExtendActivationCodeExpiryDto(), {
        months,
      });
      await expect(validate(dto)).resolves.not.toHaveLength(0);
    },
  );
});
