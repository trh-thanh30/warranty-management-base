import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CreateContentPageDto } from '@/modules/content-pages/dto/create-content-page.dto';
import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { UpdateContentPageDto } from '@/modules/content-pages/dto/update-content-page.dto';
import { ReorderContentPageFaqItemsDto } from '@/modules/content-pages/dto/reorder-content-page-faq-items.dto';
import { CreateContentPageUseCase } from '@/modules/content-pages/use-cases/create-content-page.use-case';
import { DeleteContentPageUseCase } from '@/modules/content-pages/use-cases/delete-content-page.use-case';
import { GetContentPageDetailUseCase } from '@/modules/content-pages/use-cases/get-content-page-detail.use-case';
import { GetPublishedContentPageBySlugUseCase } from '@/modules/content-pages/use-cases/get-published-content-page-by-slug.use-case';
import { ListContentPagesUseCase } from '@/modules/content-pages/use-cases/list-content-pages.use-case';
import { ListPublishedContentPagesUseCase } from '@/modules/content-pages/use-cases/list-published-content-pages.use-case';
import { ParseContentDocumentUseCase } from '@/modules/content-pages/use-cases/parse-content-document.use-case';
import { UpdateContentPageUseCase } from '@/modules/content-pages/use-cases/update-content-page.use-case';
import { ReorderContentPageFaqItemsUseCase } from '@/modules/content-pages/use-cases/reorder-content-page-faq-items.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
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
    private readonly parseContentDocumentUseCase: ParseContentDocumentUseCase,
    private readonly reorderContentPageFaqItemsUseCase: ReorderContentPageFaqItemsUseCase,
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

  @Post('content-pages/parse-document')
  @Permissions([permission_key.CONTENT_PAGE_VIEW])
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  parseDocument(@UploadedFile() file?: Express.Multer.File) {
    return this.parseContentDocumentUseCase.execute(file);
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

  @Patch('content-pages/:id/faq-items/reorder')
  @Permissions([permission_key.CONTENT_PAGE_UPDATE])
  reorderFaqItems(
    @Param('id') id: string,
    @Body() dto: ReorderContentPageFaqItemsDto,
  ) {
    return this.reorderContentPageFaqItemsUseCase.execute(id, dto);
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
