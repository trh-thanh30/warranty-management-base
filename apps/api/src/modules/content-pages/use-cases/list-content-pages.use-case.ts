import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListContentPagesUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(dto: ListContentPagesDto) {
    const pages = await this.contentPagesRepository.list(dto);

    return pages.map(toContentPageResponse);
  }
}
