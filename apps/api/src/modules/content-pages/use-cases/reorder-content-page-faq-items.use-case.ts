import { BadRequestError, NotFoundError } from '@/common/response';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { ReorderContentPageFaqItemsDto } from '@/modules/content-pages/dto/reorder-content-page-faq-items.dto';
import { Injectable } from '@nestjs/common';
import { content_page_kind } from '@prisma/client';

@Injectable()
export class ReorderContentPageFaqItemsUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(id: string, dto: ReorderContentPageFaqItemsDto) {
    const page = await this.contentPagesRepository.findById(id);
    if (!page) {
      throw new NotFoundError('Content page not found');
    }
    if (page.kind !== content_page_kind.FAQ) {
      throw new BadRequestError('Only FAQ pages can reorder FAQ items');
    }

    const existingIds = new Set(page.faq_items.map((item) => item.id));
    const containsEveryItem =
      dto.itemIds.length === existingIds.size &&
      dto.itemIds.every((itemId) => existingIds.has(itemId));

    if (!containsEveryItem) {
      throw new BadRequestError(
        'FAQ item order must contain every item exactly once',
      );
    }

    const updatedPage = await this.contentPagesRepository.reorderFaqItems(
      id,
      dto.itemIds,
    );
    return toContentPageResponse(updatedPage);
  }
}
