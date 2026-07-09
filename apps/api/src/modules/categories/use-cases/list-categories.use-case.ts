import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(query: ListCategoriesDto) {
    const result = await this.categoriesRepository.list(query);

    return {
      items: result.items.map(toCategoryResponse),
      meta: result.meta,
    };
  }
}
