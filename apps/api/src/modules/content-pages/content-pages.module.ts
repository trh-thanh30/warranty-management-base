import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ContentPagesController } from '@/modules/content-pages/content-pages.controller';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { PdfToHtmlConverter } from '@/modules/content-pages/services/pdf-to-html.converter';
import { CreateContentPageUseCase } from '@/modules/content-pages/use-cases/create-content-page.use-case';
import { DeleteContentPageUseCase } from '@/modules/content-pages/use-cases/delete-content-page.use-case';
import { GetContentPageDetailUseCase } from '@/modules/content-pages/use-cases/get-content-page-detail.use-case';
import { GetPublishedContentPageBySlugUseCase } from '@/modules/content-pages/use-cases/get-published-content-page-by-slug.use-case';
import { ListContentPagesUseCase } from '@/modules/content-pages/use-cases/list-content-pages.use-case';
import { ListPublishedContentPagesUseCase } from '@/modules/content-pages/use-cases/list-published-content-pages.use-case';
import { ParseContentDocumentUseCase } from '@/modules/content-pages/use-cases/parse-content-document.use-case';
import { UpdateContentPageUseCase } from '@/modules/content-pages/use-cases/update-content-page.use-case';
import { ReorderContentPageFaqItemsUseCase } from '@/modules/content-pages/use-cases/reorder-content-page-faq-items.use-case';
import { CreateContentPageFaqItemUseCase } from '@/modules/content-pages/use-cases/create-content-page-faq-item.use-case';
import { UpdateContentPageFaqItemUseCase } from '@/modules/content-pages/use-cases/update-content-page-faq-item.use-case';
import { DeleteContentPageFaqItemUseCase } from '@/modules/content-pages/use-cases/delete-content-page-faq-item.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [ContentPagesController],
  providers: [
    ContentPagesRepository,
    ListContentPagesUseCase,
    GetContentPageDetailUseCase,
    CreateContentPageUseCase,
    UpdateContentPageUseCase,
    DeleteContentPageUseCase,
    ListPublishedContentPagesUseCase,
    GetPublishedContentPageBySlugUseCase,
    PdfToHtmlConverter,
    ParseContentDocumentUseCase,
    ReorderContentPageFaqItemsUseCase,
    CreateContentPageFaqItemUseCase,
    UpdateContentPageFaqItemUseCase,
    DeleteContentPageFaqItemUseCase,
  ],
})
export class ContentPagesModule {}
