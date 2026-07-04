import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CreateContentPageDto } from '@/modules/content-pages/dto/create-content-page.dto';
import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { UpdateContentPageDto } from '@/modules/content-pages/dto/update-content-page.dto';
import { CreateContentPageUseCase } from '@/modules/content-pages/use-cases/create-content-page.use-case';
import { DeleteContentPageUseCase } from '@/modules/content-pages/use-cases/delete-content-page.use-case';
import { GetContentPageDetailUseCase } from '@/modules/content-pages/use-cases/get-content-page-detail.use-case';
import { GetPublishedContentPageBySlugUseCase } from '@/modules/content-pages/use-cases/get-published-content-page-by-slug.use-case';
import { ListContentPagesUseCase } from '@/modules/content-pages/use-cases/list-content-pages.use-case';
import { ListPublishedContentPagesUseCase } from '@/modules/content-pages/use-cases/list-published-content-pages.use-case';
import { UpdateContentPageUseCase } from '@/modules/content-pages/use-cases/update-content-page.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller()
export class ContentPagesController {
  constructor(
    private readonly listContentPagesUseCase: ListContentPagesUseCase,
    private readonly getContentPageDetailUseCase: GetContentPageDetailUseCase,
    private readonly createContentPageUseCase: CreateContentPageUseCase,
    private readonly updateContentPageUseCase: UpdateContentPageUseCase,
    private readonly deleteContentPageUseCase: DeleteContentPageUseCase,
    private readonly listPublishedContentPagesUseCase: ListPublishedContentPagesUseCase,
    private readonly getPublishedContentPageBySlugUseCase: GetPublishedContentPageBySlugUseCase,
  ) {}

  @Get('content-pages')
  @Permissions([permission_key.CONTENT_PAGE_VIEW])
  list(@Query() query: ListContentPagesDto) {
    return this.listContentPagesUseCase.execute(query);
  }

  @Post('content-pages')
  @Permissions([permission_key.CONTENT_PAGE_CREATE])
  create(@Body() dto: CreateContentPageDto) {
    return this.createContentPageUseCase.execute(dto);
  }

  @Get('content-pages/:id')
  @Permissions([permission_key.CONTENT_PAGE_VIEW])
  detail(@Param('id') id: string) {
    return this.getContentPageDetailUseCase.execute(id);
  }

  @Patch('content-pages/:id')
  @Permissions([permission_key.CONTENT_PAGE_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateContentPageDto) {
    return this.updateContentPageUseCase.execute(id, dto);
  }

  @Delete('content-pages/:id')
  @Permissions([permission_key.CONTENT_PAGE_DELETE])
  delete(@Param('id') id: string) {
    return this.deleteContentPageUseCase.execute(id);
  }

  @Public()
  @Get('public/content-pages')
  listPublished(@Query() query: ListContentPagesDto) {
    return this.listPublishedContentPagesUseCase.execute(query);
  }

  @Public()
  @Get('public/content-pages/:slug')
  getPublishedBySlug(@Param('slug') slug: string) {
    return this.getPublishedContentPageBySlugUseCase.execute(slug);
  }
}
