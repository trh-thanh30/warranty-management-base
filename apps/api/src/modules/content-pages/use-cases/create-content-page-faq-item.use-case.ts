import { BadRequestError, NotFoundError } from '@/common/response';
import { ContentPageFaqItemDto } from '@/modules/content-pages/dto/content-page-faq-item.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageFaqItemResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import { content_page_kind } from '@prisma/client';

@Injectable()
export class CreateContentPageFaqItemUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(contentPageId: string, dto: ContentPageFaqItemDto) {
    const page = await this.contentPagesRepository.findById(contentPageId);
    if (!page) throw new NotFoundError('Content page not found');
    if (page.kind !== content_page_kind.FAQ) {
      throw new BadRequestError('FAQ items can only be added to FAQ pages');
    }

    const item = await this.contentPagesRepository.createFaqItem(
      contentPageId,
      {
        answer: dto.answer.trim(),
        is_active: dto.isActive ?? true,
        question: dto.question.trim(),
      },
    );
    return toContentPageFaqItemResponse(item);
  }
}
