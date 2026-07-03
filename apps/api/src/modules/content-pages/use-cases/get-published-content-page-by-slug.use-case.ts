import { NotFoundError } from '@/common/response';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetPublishedContentPageBySlugUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(slug: string) {
    const page = await this.contentPagesRepository.findPublishedBySlug(
      slug.trim().toLowerCase(),
    );

    if (!page) {
      throw new NotFoundError('Published content page not found');
    }

    return toContentPageResponse(page);
  }
}
