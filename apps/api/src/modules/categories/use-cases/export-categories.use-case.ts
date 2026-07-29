import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { toCategoryExcelRow } from '@/modules/categories/excel/category-excel.mapper';
import { createCategoryExportWorkbook } from '@/modules/categories/excel/category-workbook.factory';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(dto: ListCategoriesDto) {
    const categories = await this.categoriesRepository.listForExport(dto);
    return createCategoryExportWorkbook(categories.map(toCategoryExcelRow));
  }
}
