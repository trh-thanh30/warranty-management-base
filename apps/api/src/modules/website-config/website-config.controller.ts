import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import {
  UpdateWebsiteSiteSettingDto,
  WebsiteLocaleQueryDto,
  WebsiteVersionedDto,
} from '@/modules/website-config/dto/website-config.dto';
import { WebsiteSiteConfigUseCase } from '@/modules/website-config/use-cases/website-site-config.use-case';
import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { permission_key, type User as UserEntity } from '@prisma/client';

@Controller()
export class WebsiteConfigController {
  constructor(private readonly siteUseCase: WebsiteSiteConfigUseCase) {}

  @Get('website-config/overview')
  @Permissions([permission_key.WEBSITE_CONFIG_VIEW])
  overview() {
    return this.siteUseCase.overview();
  }

  @Get('website-config/site-settings')
  @Permissions([permission_key.WEBSITE_CONFIG_VIEW])
  getSite() {
    return this.siteUseCase.get();
  }

  @Patch('website-config/site-settings/draft')
  @Permissions([permission_key.WEBSITE_CONFIG_UPDATE])
  saveSite(@Body() dto: UpdateWebsiteSiteSettingDto, @User() user: UserEntity) {
    return this.siteUseCase.save(dto, user.id);
  }

  @Post('website-config/site-settings/publish')
  @Permissions([permission_key.WEBSITE_CONFIG_PUBLISH])
  publishSite(@Body() dto: WebsiteVersionedDto, @User() user: UserEntity) {
    return this.siteUseCase.publish(dto.expectedVersion, user.id);
  }

  @Public()
  @Get('public/site-settings')
  publicSite(@Query() query: WebsiteLocaleQueryDto) {
    return this.siteUseCase.getPublic(query.locale);
  }
}
