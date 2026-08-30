import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BadRequestError } from '@/common/response';
import { UpdateActivationCodePolicyDto } from '@/modules/system-config/dto/update-activation-code-policy.dto';
import { GetActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/get-activation-code-policy.use-case';
import { UpdateActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/update-activation-code-policy.use-case';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { permission_key } from '@prisma/client';

type RequestUser = { id?: string };

@Controller('system-config')
export class SystemConfigController {
  constructor(
    private readonly getPolicyUseCase: GetActivationCodePolicyUseCase,
    private readonly updatePolicyUseCase: UpdateActivationCodePolicyUseCase,
  ) {}

  @Get('activation-code-policy')
  @Permissions([permission_key.SYSTEM_VIEW])
  getActivationCodePolicy() {
    return this.getPolicyUseCase.execute();
  }

  @Post('activation-code-policy')
  @Permissions([permission_key.WARRANTY_UPDATE])
  updateActivationCodePolicy(
    @Body() dto: UpdateActivationCodePolicyDto,
    @User() user: RequestUser,
  ) {
    if (!user?.id) throw new BadRequestError('Authenticated user is required');
    return this.updatePolicyUseCase.execute(dto, user.id);
  }
}
