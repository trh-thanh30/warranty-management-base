import { NotFoundError } from '@/common/response';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetContentPageDetailUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(id: string) {
    const page = await this.contentPagesRepository.findById(id);

    if (!page) {
      throw new NotFoundError('Content page not found');
    }

    return toContentPageResponse(page);
  }
}
