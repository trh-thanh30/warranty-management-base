import { PrismaModule } from '@/database/prisma/prisma.module';
import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { GetActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/get-activation-code-policy.use-case';
import { UpdateActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/update-activation-code-policy.use-case';
import { SystemConfigController } from '@/modules/system-config/system-config.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SystemConfigController],
  providers: [
    SystemConfigRepository,
    ActivationCodePolicyService,
    GetActivationCodePolicyUseCase,
    UpdateActivationCodePolicyUseCase,
  ],
  exports: [ActivationCodePolicyService, GetActivationCodePolicyUseCase],
})
export class SystemConfigModule {}
