import { RevokeActivationCodeBatchDto } from '@/modules/activation-codes/dto/revoke-activation-code-batch.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('RevokeActivationCodeBatchDto', () => {
  it('uses the safe scope when legacy clients send no body fields', async () => {
    const dto = plainToInstance(RevokeActivationCodeBatchDto, {});

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.scope).toBe('UNASSIGNED_ONLY');
  });

  it.each(['UNASSIGNED_ONLY', 'ALL_REVOCABLE'])(
    '%s is valid',
    async (scope) => {
      const dto = plainToInstance(RevokeActivationCodeBatchDto, { scope });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );

  it('rejects an unknown scope', async () => {
    const dto = plainToInstance(RevokeActivationCodeBatchDto, {
      scope: 'EVERYTHING',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
