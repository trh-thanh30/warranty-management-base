import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { ListCategoryTreeDto } from '@/modules/categories/dto/list-category-tree.dto';
import { ListCategoryParentOptionsDto } from '@/modules/categories/dto/list-category-parent-options.dto';
import { ReorderCategoriesDto } from '@/modules/categories/dto/reorder-categories.dto';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { UpdateCategoryActivationFieldsDto } from '@/modules/categories/dto/update-category-activation-fields.dto';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { DownloadCategoryImportTemplateUseCase } from '@/modules/categories/use-cases/download-category-import-template.use-case';
import { ExportCategoriesUseCase } from '@/modules/categories/use-cases/export-categories.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { GetCategoryActivationFieldsUseCase } from '@/modules/categories/use-cases/get-category-activation-fields.use-case';
import { ImportCategoriesUseCase } from '@/modules/categories/use-cases/import-categories.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ListCategoryTreeUseCase } from '@/modules/categories/use-cases/list-category-tree.use-case';
import { ListCategoryParentOptionsUseCase } from '@/modules/categories/use-cases/list-category-parent-options.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import { UpdateCategoryActivationFieldsUseCase } from '@/modules/categories/use-cases/update-category-activation-fields.use-case';
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
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { permission_key, user_role } from '@prisma/client';
import express from 'express';

type RequestUser = { role: user_role };

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly listCategoryTreeUseCase: ListCategoryTreeUseCase,
    private readonly listCategoryParentOptionsUseCase: ListCategoryParentOptionsUseCase,
    private readonly getCategoryDetailUseCase: GetCategoryDetailUseCase,
    private readonly getCategoryActivationFieldsUseCase: GetCategoryActivationFieldsUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly reorderCategoriesUseCase: ReorderCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly updateCategoryActivationFieldsUseCase: UpdateCategoryActivationFieldsUseCase,
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

  @Get('tree')
  @Permissions([permission_key.CATEGORY_VIEW])
  tree(@Query() query: ListCategoryTreeDto) {
    return this.listCategoryTreeUseCase.execute(query);
  }

  @Get('parent-options')
  @Permissions([permission_key.CATEGORY_VIEW])
  parentOptions(@Query() query: ListCategoryParentOptionsDto) {
    return this.listCategoryParentOptionsUseCase.execute(query);
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
  create(@Body() dto: CreateCategoryDto, @User() user: RequestUser) {
    return this.createCategoryUseCase.execute(dto, user.role);
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

  @Get(':id/activation-fields')
  @Permissions([permission_key.CATEGORY_VIEW])
  getActivationFields(@Param('id') id: string) {
    return this.getCategoryActivationFieldsUseCase.execute(id);
  }

  @Put(':id/activation-fields')
  @Permissions([permission_key.CATEGORY_UPDATE])
  updateActivationFields(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryActivationFieldsDto,
  ) {
    return this.updateCategoryActivationFieldsUseCase.execute(id, dto);
  }

  @Patch(':id')
  @Permissions([permission_key.CATEGORY_UPDATE])
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @User() user: RequestUser,
  ) {
    return this.updateCategoryUseCase.execute(id, dto, user.role);
  }

  @Delete(':id')
  @Permissions([permission_key.CATEGORY_DELETE])
  deactivate(@Param('id') id: string) {
    return this.deactivateCategoryUseCase.execute(id);
  }
}
