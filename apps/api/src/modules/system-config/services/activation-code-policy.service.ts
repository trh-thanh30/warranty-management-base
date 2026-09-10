import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { UpdateActivationCodePolicyDto } from '@/modules/system-config/dto/update-activation-code-policy.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { BadRequestError } from '@/common/response';

const POLICY_KEY = 'activation_code_policy';

export type ActivationCodePolicy = {
  expiryMonths: number;
  defaultBatchQuantity: number;
  minBatchQuantity: number;
  maxBatchQuantity: number;
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
    const defaults = {
      expiryMonths: this.numberConfig('expiryMonths', 6),
      defaultBatchQuantity: this.numberConfig('defaultBatchQuantity', 50),
      minBatchQuantity: this.numberConfig('minBatchQuantity', 50),
      maxBatchQuantity: this.numberConfig('maxBatchQuantity', 1000),
    };
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const policy = value as Record<string, unknown>;
      return {
        expiryMonths: this.policyNumber(
          policy.expiryMonths,
          defaults.expiryMonths,
        ),
        defaultBatchQuantity: this.policyNumber(
          policy.defaultBatchQuantity,
          defaults.defaultBatchQuantity,
        ),
        minBatchQuantity: this.policyNumber(
          policy.minBatchQuantity,
          defaults.minBatchQuantity,
        ),
        maxBatchQuantity: this.policyNumber(
          policy.maxBatchQuantity,
          defaults.maxBatchQuantity,
        ),
      };
    }
    return defaults;
  }

  async update(input: UpdateActivationCodePolicyDto, updatedById: string) {
    if (
      input.minBatchQuantity > input.maxBatchQuantity ||
      input.defaultBatchQuantity < input.minBatchQuantity ||
      input.defaultBatchQuantity > input.maxBatchQuantity
    ) {
      throw new BadRequestError(
        'Default batch quantity must be within the configured minimum and maximum',
        'ACTIVATION_CODE_POLICY_QUANTITY_INVALID',
        {
          defaultBatchQuantity: input.defaultBatchQuantity,
          minBatchQuantity: input.minBatchQuantity,
          maxBatchQuantity: input.maxBatchQuantity,
        },
      );
    }
    const policy: ActivationCodePolicy = {
      expiryMonths: input.expiryMonths,
      defaultBatchQuantity: input.defaultBatchQuantity,
      minBatchQuantity: input.minBatchQuantity,
      maxBatchQuantity: input.maxBatchQuantity,
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

  private policyNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback;
  }
}
