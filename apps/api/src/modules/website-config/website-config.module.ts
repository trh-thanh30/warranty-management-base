import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { WebsiteConfigRepository } from '@/modules/website-config/repository/website-config.repository';
import { WebsiteConfigPolicyService } from '@/modules/website-config/service/website-config-policy.service';
import { WebsiteSiteConfigUseCase } from '@/modules/website-config/use-cases/website-site-config.use-case';
import { WebsiteConfigController } from '@/modules/website-config/website-config.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, AssetsModule],
  controllers: [WebsiteConfigController],
  providers: [
    WebsiteConfigRepository,
    WebsiteConfigPolicyService,
    WebsiteSiteConfigUseCase,
  ],
})
export class WebsiteConfigModule {}
