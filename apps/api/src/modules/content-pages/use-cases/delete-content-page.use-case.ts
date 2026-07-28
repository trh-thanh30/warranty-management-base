import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { Injectable } from '@nestjs/common';
import { asset_type } from '@prisma/client';
import { extractMediaUrls } from '@repo/shared/utils';

@Injectable()
export class DeleteContentPageUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string) {
    const existingPage = await this.contentPagesRepository.findById(id);

    if (!existingPage) {
      throw new NotFoundError('Content page not found');
    }

    const richText = [
      existingPage.content,
      ...existingPage.faq_items.map((item) => item.answer),
    ].join('');

    for (const url of extractMediaUrls(richText)) {
      await this.assetsService?.deleteAssetByUrl(url, {
        folder: 'rich-text',
        types: [asset_type.IMAGE, asset_type.VIDEO],
      });
    }

    await this.contentPagesRepository.delete(id);
    return { success: true };
  }
}
