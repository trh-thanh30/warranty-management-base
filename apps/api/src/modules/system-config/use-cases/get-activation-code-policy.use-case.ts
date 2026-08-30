import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetActivationCodePolicyUseCase {
  constructor(private readonly policyService: ActivationCodePolicyService) {}

  execute() {
    return this.policyService.get();
  }
}
