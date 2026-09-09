import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { UpdateActivationCodePolicyDto } from '@/modules/system-config/dto/update-activation-code-policy.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

const POLICY_KEY = 'activation_code_policy';

export type ActivationCodePolicy = {
  expiryMonths: number;
  defaultBatchQuantity: number;
};

@Injectable()
export class ActivationCodePolicyService {
  constructor(
    private readonly repository: SystemConfigRepository,
    private readonly configService: ConfigService,
  ) {}

  async get(): Promise<ActivationCodePolicy> {
    const stored = await this.repository.findByKey(POLICY_KEY);
    const value = stored?.value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const policy = value as Record<string, unknown>;
      if (
        typeof policy.expiryMonths === 'number' &&
        typeof policy.defaultBatchQuantity === 'number'
      ) {
        return {
          expiryMonths: policy.expiryMonths,
          defaultBatchQuantity: policy.defaultBatchQuantity,
        };
      }
    }
    return {
      expiryMonths: this.numberConfig('expiryMonths', 6),
      defaultBatchQuantity: this.numberConfig('defaultBatchQuantity', 50),
    };
  }

  async update(input: UpdateActivationCodePolicyDto, updatedById: string) {
    const policy: ActivationCodePolicy = {
      expiryMonths: input.expiryMonths,
      defaultBatchQuantity: input.defaultBatchQuantity,
    };
    await this.repository.updateActivationCodePolicy(
      POLICY_KEY,
      policy,
      updatedById,
      policy.expiryMonths,
    );
    return policy;
  }

  private numberConfig(key: string, fallback: number): number {
    const value = this.configService.get<number>(`activationCode.${key}`);
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback;
  }
}
