import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { Injectable } from '@nestjs/common';
import { asset_type } from '@prisma/client';
import { extractMediaUrls } from '@repo/shared/utils';

@Injectable()
export class DeleteContentPageFaqItemUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(contentPageId: string, itemId: string) {
    const existingItem = await this.contentPagesRepository.findFaqItem(
      contentPageId,
      itemId,
    );
    if (!existingItem) throw new NotFoundError('FAQ item not found');

    for (const url of extractMediaUrls(existingItem.answer)) {
      await this.assetsService.deleteAssetByUrl(url, {
        folder: 'rich-text',
        types: [asset_type.IMAGE, asset_type.VIDEO],
      });
    }

    await this.contentPagesRepository.deleteFaqItem(contentPageId, itemId);
    return { success: true };
  }
}
