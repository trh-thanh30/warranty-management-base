import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateContentPageFaqItemDto } from '@/modules/content-pages/dto/update-content-page-faq-item.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageFaqItemResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import { asset_type } from '@prisma/client';
import { getRemovedMediaUrls } from '@repo/shared/utils';

@Injectable()
export class UpdateContentPageFaqItemUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(
    contentPageId: string,
    itemId: string,
    dto: UpdateContentPageFaqItemDto,
  ) {
    const existingItem = await this.contentPagesRepository.findFaqItem(
      contentPageId,
      itemId,
    );
    if (!existingItem) throw new NotFoundError('FAQ item not found');

    const nextAnswer = dto.answer?.trim();
    if (nextAnswer !== undefined) {
      for (const url of getRemovedMediaUrls(existingItem.answer, nextAnswer)) {
        await this.assetsService.deleteAssetByUrl(url, {
          folder: 'rich-text',
          types: [asset_type.IMAGE, asset_type.VIDEO],
        });
      }
    }

    const item = await this.contentPagesRepository.updateFaqItem(itemId, {
      answer: nextAnswer,
      is_active: dto.isActive,
      question: dto.question?.trim(),
    });
    return toContentPageFaqItemResponse(item);
  }
}
