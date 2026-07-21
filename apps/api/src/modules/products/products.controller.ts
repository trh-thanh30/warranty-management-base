import { Permissions } from '@/common/decorators/permissions.decorator';
import { AttachProductAssetDto } from '@/modules/products/dto/attach-product-asset.dto';
import { AssignProductOwnerDto } from '@/modules/products/dto/assign-product-owner.dto';
import { ConfirmProductImportDto } from '@/modules/products/dto/confirm-product-import.dto';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { UpdateProductAssetDto } from '@/modules/products/dto/update-product-asset.dto';
import { AttachProductAssetUseCase } from '@/modules/products/use-cases/attach-product-asset.use-case';
import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';
import { ConfirmProductImportUseCase } from '@/modules/products/use-cases/confirm-product-import.use-case';
import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { DownloadProductImportTemplateUseCase } from '@/modules/products/use-cases/download-product-import-template.use-case';
import { ExportProductsUseCase } from '@/modules/products/use-cases/export-products.use-case';
import { GetProductDetailUseCase } from '@/modules/products/use-cases/get-product-detail.use-case';
import { ListProductsUseCase } from '@/modules/products/use-cases/list-products.use-case';
import { PreviewProductImportUseCase } from '@/modules/products/use-cases/preview-product-import.use-case';
import { SoftDeleteProductUseCase } from '@/modules/products/use-cases/soft-delete-product.use-case';
import { RemoveProductAssetUseCase } from '@/modules/products/use-cases/remove-product-asset.use-case';
import { UpdateProductAssetUseCase } from '@/modules/products/use-cases/update-product-asset.use-case';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
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

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly softDeleteProductUseCase: SoftDeleteProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductDetailUseCase: GetProductDetailUseCase,
    private readonly assignProductOwnerUseCase: AssignProductOwnerUseCase,
    private readonly attachProductAssetUseCase: AttachProductAssetUseCase,
    private readonly updateProductAssetUseCase: UpdateProductAssetUseCase,
    private readonly removeProductAssetUseCase: RemoveProductAssetUseCase,
    private readonly confirmProductImportUseCase: ConfirmProductImportUseCase,
    private readonly downloadProductImportTemplateUseCase: DownloadProductImportTemplateUseCase,
    private readonly exportProductsUseCase: ExportProductsUseCase,
    private readonly previewProductImportUseCase: PreviewProductImportUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.PRODUCT_VIEW])
  list(@Query() query: ListProductsDto) {
    return this.listProductsUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.PRODUCT_VIEW])
  async exportProducts(
    @Query() query: ListProductsDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportProductsUseCase.execute(query);
    this.sendExcelFile(res, buffer, `products-${this.today()}.xlsx`);
  }

  @Get('import-template')
  @Permissions([permission_key.PRODUCT_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer = await this.downloadProductImportTemplateUseCase.execute();
    this.sendExcelFile(res, buffer, 'product-import-template.xlsx');
  }

  @Post('import/preview')
  @Permissions([permission_key.PRODUCT_CREATE])
  @UseInterceptors(FileInterceptor('file'))
  previewImport(@UploadedFile() file: Express.Multer.File) {
    return this.previewProductImportUseCase.execute(file);
  }

  @Post('import/confirm')
  @Permissions([permission_key.PRODUCT_CREATE])
  confirmImport(@Body() dto: ConfirmProductImportDto) {
    return this.confirmProductImportUseCase.execute(dto);
  }

  @Post()
  @Permissions([permission_key.PRODUCT_CREATE])
  create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.PRODUCT_VIEW])
  detail(@Param('id') id: string) {
    return this.getProductDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.PRODUCT_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Permissions([permission_key.PRODUCT_DELETE])
  remove(@Param('id') id: string) {
    return this.softDeleteProductUseCase.execute(id);
  }

  @Post(':id/assign-owner')
  @Permissions([permission_key.PRODUCT_ASSIGN_OWNER])
  assignOwner(@Param('id') id: string, @Body() dto: AssignProductOwnerDto) {
    return this.assignProductOwnerUseCase.execute(id, dto);
  }

  @Post(':id/assets')
  @Permissions([permission_key.PRODUCT_UPDATE])
  attachAsset(@Param('id') id: string, @Body() dto: AttachProductAssetDto) {
    return this.attachProductAssetUseCase.execute(id, dto);
  }

  @Patch(':id/assets/:productAssetId')
  @Permissions([permission_key.PRODUCT_UPDATE])
  updateAsset(
    @Param('id') id: string,
    @Param('productAssetId') productAssetId: string,
    @Body() dto: UpdateProductAssetDto,
  ) {
    return this.updateProductAssetUseCase.execute(id, productAssetId, dto);
  }

  @Delete(':id/assets/:productAssetId')
  @Permissions([permission_key.PRODUCT_UPDATE])
  removeAsset(
    @Param('id') id: string,
    @Param('productAssetId') productAssetId: string,
  ) {
    return this.removeProductAssetUseCase.execute(id, productAssetId);
  }

  private sendExcelFile(
    res: express.Response,
    buffer: Buffer,
    filename: string,
  ) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  private today() {
    return new Date().toISOString().slice(0, 10);
  }
}
