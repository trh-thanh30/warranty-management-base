import { NotFoundError } from '@/common/response';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteContentPageUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(id: string) {
    const existingPage = await this.contentPagesRepository.findById(id);

    if (!existingPage) {
      throw new NotFoundError('Content page not found');
    }

    await this.contentPagesRepository.delete(id);

    return { success: true };
  }
}
