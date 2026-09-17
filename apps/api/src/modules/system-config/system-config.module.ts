import { PrismaModule } from '@/database/prisma/prisma.module';
import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { ActivationCodePolicyService } from '@/modules/system-config/services/activation-code-policy.service';
import { ContactNotificationSettingsService } from '@/modules/system-config/services/contact-notification-settings.service';
import { GetActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/get-activation-code-policy.use-case';
import { GetContactNotificationSettingsUseCase } from '@/modules/system-config/use-cases/get-contact-notification-settings.use-case';
import { UpdateActivationCodePolicyUseCase } from '@/modules/system-config/use-cases/update-activation-code-policy.use-case';
import { UpdateContactNotificationSettingsUseCase } from '@/modules/system-config/use-cases/update-contact-notification-settings.use-case';
import { SystemConfigController } from '@/modules/system-config/system-config.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SystemConfigController],
  providers: [
    SystemConfigRepository,
    ActivationCodePolicyService,
    ContactNotificationSettingsService,
    GetActivationCodePolicyUseCase,
    GetContactNotificationSettingsUseCase,
    UpdateActivationCodePolicyUseCase,
    UpdateContactNotificationSettingsUseCase,
  ],
  exports: [
    ActivationCodePolicyService,
    GetActivationCodePolicyUseCase,
    ContactNotificationSettingsService,
  ],
})
export class SystemConfigModule {}
