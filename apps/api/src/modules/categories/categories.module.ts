import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { DownloadCategoryImportTemplateUseCase } from '@/modules/categories/use-cases/download-category-import-template.use-case';
import { ExportCategoriesUseCase } from '@/modules/categories/use-cases/export-categories.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { ImportCategoriesUseCase } from '@/modules/categories/use-cases/import-categories.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ListPublicProductCategoriesUseCase } from '@/modules/categories/use-cases/list-public-product-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesRepository,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    ListPublicProductCategoriesUseCase,
    GetCategoryDetailUseCase,
    ReorderCategoriesUseCase,
    UpdateCategoryUseCase,
    DeactivateCategoryUseCase,
    DownloadCategoryImportTemplateUseCase,
    ExportCategoriesUseCase,
    ImportCategoriesUseCase,
  ],
  exports: [CategoriesRepository, ListPublicProductCategoriesUseCase],
})
export class CategoriesModule {}
