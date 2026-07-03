import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListPublishedContentPagesUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(dto: Pick<ListContentPagesDto, 'kind' | 'search'>) {
    const pages = await this.contentPagesRepository.listPublished(dto);

    return pages.map(toContentPageResponse);
  }
}
