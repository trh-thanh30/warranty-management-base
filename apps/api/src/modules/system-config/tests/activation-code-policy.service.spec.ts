import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { ConfigService } from '@nestjs/config';

describe('ActivationCodePolicyService', () => {
  it('updates the policy and synchronizes existing activation-code expiry dates', async () => {
    const repository = {
      updateActivationCodePolicy: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ActivationCodePolicyService(
      // Test double intentionally implements only the method exercised here.

      repository as unknown as SystemConfigRepository,
      // This test does not exercise fallback environment configuration.

      {} as unknown as ConfigService,
    );
    const policy = { expiryMonths: 12, defaultBatchQuantity: 50 };

    await expect(service.update(policy, 'admin-id')).resolves.toEqual(policy);
    expect(repository.updateActivationCodePolicy).toHaveBeenCalledWith(
      'activation_code_policy',
      policy,
      'admin-id',
      12,
    );
  });
});
