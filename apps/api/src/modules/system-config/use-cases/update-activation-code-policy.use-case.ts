import { UpdateActivationCodePolicyDto } from '@/modules/system-config/dto/update-activation-code-policy.dto';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateActivationCodePolicyUseCase {
  constructor(private readonly policyService: ActivationCodePolicyService) {}

  execute(input: UpdateActivationCodePolicyDto, actorId: string) {
    return this.policyService.update(input, actorId);
  }
}
