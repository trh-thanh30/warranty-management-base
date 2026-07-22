import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { ReorderCategoriesDto } from '@/modules/categories/dto/reorder-categories.dto';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { DownloadCategoryImportTemplateUseCase } from '@/modules/categories/use-cases/download-category-import-template.use-case';
import { ExportCategoriesUseCase } from '@/modules/categories/use-cases/export-categories.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { ImportCategoriesUseCase } from '@/modules/categories/use-cases/import-categories.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { permission_key } from '@prisma/client';
import express from 'express';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryDetailUseCase: GetCategoryDetailUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly reorderCategoriesUseCase: ReorderCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deactivateCategoryUseCase: DeactivateCategoryUseCase,
    private readonly downloadCategoryImportTemplateUseCase: DownloadCategoryImportTemplateUseCase,
    private readonly exportCategoriesUseCase: ExportCategoriesUseCase,
    private readonly importCategoriesUseCase: ImportCategoriesUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.CATEGORY_VIEW])
  list(@Query() query: ListCategoriesDto) {
    return this.listCategoriesUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.CATEGORY_VIEW])
  async exportCategories(
    @Query() query: ListCategoriesDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportCategoriesUseCase.execute(query);
    sendExcelFile(res, buffer, createDatedExcelFilename('categories'));
  }

  @Get('import-template')
  @Permissions([permission_key.CATEGORY_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer = await this.downloadCategoryImportTemplateUseCase.execute();
    sendExcelFile(res, buffer, 'category-import-template.xlsx');
  }

  @Post('import')
  @Permissions([permission_key.CATEGORY_CREATE])
  @UseInterceptors(FileInterceptor('file'))
  importCategories(@UploadedFile() file: Express.Multer.File) {
    return this.importCategoriesUseCase.execute(file);
  }

  @Post()
  @Permissions([permission_key.CATEGORY_CREATE])
  create(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }

  @Patch('reorder')
  @Permissions([permission_key.CATEGORY_UPDATE])
  reorder(@Body() dto: ReorderCategoriesDto) {
    return this.reorderCategoriesUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.CATEGORY_VIEW])
  detail(@Param('id') id: string) {
    return this.getCategoryDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.CATEGORY_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.updateCategoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Permissions([permission_key.CATEGORY_DELETE])
  deactivate(@Param('id') id: string) {
    return this.deactivateCategoryUseCase.execute(id);
  }
}
