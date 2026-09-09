import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { ConfigService } from '@nestjs/config';

describe('ActivationCodePolicyService', () => {
  const config = {
    get: jest.fn(
      (key: string) =>
        ({
          'activationCode.defaultBatchQuantity': 50,
          'activationCode.expiryMonths': 6,
          'activationCode.maxBatchQuantity': 1000,
          'activationCode.minBatchQuantity': 50,
        })[key],
    ),
  };

  it('updates the policy and synchronizes existing activation-code expiry dates', async () => {
    const repository = {
      updateActivationCodePolicy: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ActivationCodePolicyService(
      // Test double intentionally implements only the method exercised here.

      repository as unknown as SystemConfigRepository,
      // This test does not exercise fallback environment configuration.

      config as unknown as ConfigService,
    );
    const policy = {
      expiryMonths: 12,
      defaultBatchQuantity: 100,
      minBatchQuantity: 50,
      maxBatchQuantity: 500,
    };

    await expect(service.update(policy, 'admin-id')).resolves.toEqual(policy);
    expect(repository.updateActivationCodePolicy).toHaveBeenCalledWith(
      'activation_code_policy',
      policy,
      'admin-id',
      12,
    );
  });

  it('fills new quantity bounds when reading a legacy stored policy', async () => {
    const repository = {
      findByKey: jest.fn().mockResolvedValue({
        value: { expiryMonths: 12, defaultBatchQuantity: 100 },
      }),
    };
    const service = new ActivationCodePolicyService(
      repository as unknown as SystemConfigRepository,
      config as unknown as ConfigService,
    );

    await expect(service.get()).resolves.toEqual({
      expiryMonths: 12,
      defaultBatchQuantity: 100,
      minBatchQuantity: 50,
      maxBatchQuantity: 1000,
    });
  });

  it('rejects a default quantity outside the configured range', async () => {
    const repository = { updateActivationCodePolicy: jest.fn() };
    const service = new ActivationCodePolicyService(
      repository as unknown as SystemConfigRepository,
      config as unknown as ConfigService,
    );

    await expect(
      service.update(
        {
          expiryMonths: 12,
          defaultBatchQuantity: 50,
          minBatchQuantity: 100,
          maxBatchQuantity: 500,
        },
        'admin-id',
      ),
    ).rejects.toMatchObject({
      code: 'ACTIVATION_CODE_POLICY_QUANTITY_INVALID',
    });
    expect(repository.updateActivationCodePolicy).not.toHaveBeenCalled();
  });
});
