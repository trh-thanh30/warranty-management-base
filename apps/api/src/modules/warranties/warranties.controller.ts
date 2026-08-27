import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { User } from '@/common/decorators/user.decorator';
import { ActivateWarrantyByCodeDto } from '@/modules/warranties/dto/activate-warranty-by-code.dto';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { ManualWarrantyActivationDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { UpdateWarrantyDto } from '@/modules/warranties/dto/update-warranty.dto';
import { VoidWarrantyDto } from '@/modules/warranties/dto/void-warranty.dto';
import { ActivateWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/activate-warranty-by-code.use-case';
import { ActivateProductWarrantyUseCase } from '@/modules/warranties/use-cases/activate-product-warranty.use-case';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { GetMyProductWarrantyUseCase } from '@/modules/warranties/use-cases/get-my-product-warranty.use-case';
import { GetWarrantyDetailUseCase } from '@/modules/warranties/use-cases/get-warranty-detail.use-case';
import { GetWarrantyByProductUseCase } from '@/modules/warranties/use-cases/get-warranty-by-product.use-case';
import { ListMyProductsUseCase } from '@/modules/warranties/use-cases/list-my-products.use-case';
import { ListWarrantiesUseCase } from '@/modules/warranties/use-cases/list-warranties.use-case';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';
import { LookupWarrantyForCustomerUseCase } from '@/modules/warranties/use-cases/lookup-warranty-for-customer.use-case';
import { ManualWarrantyActivationUseCase } from '@/modules/warranties/use-cases/manual-warranty-activation.use-case';
import { DownloadWarrantyImportTemplateUseCase } from '@/modules/warranties/use-cases/download-warranty-import-template.use-case';
import { ExportWarrantiesUseCase } from '@/modules/warranties/use-cases/export-warranties.use-case';
import { PreviewWarrantyImportUseCase } from '@/modules/warranties/use-cases/preview-warranty-import.use-case';
import { UpdateWarrantyUseCase } from '@/modules/warranties/use-cases/update-warranty.use-case';
import { VoidWarrantyUseCase } from '@/modules/warranties/use-cases/void-warranty.use-case';
import {
  Body,
  Controller,
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

type RequestUser = {
  id: string;
};

@Controller()
export class WarrantiesController {
  constructor(
    private readonly activateWarrantyUseCase: ActivateWarrantyUseCase,
    private readonly activateWarrantyByCodeUseCase: ActivateWarrantyByCodeUseCase,
    private readonly activateProductWarrantyUseCase: ActivateProductWarrantyUseCase,
    private readonly getWarrantyDetailUseCase: GetWarrantyDetailUseCase,
    private readonly getWarrantyByProductUseCase: GetWarrantyByProductUseCase,
    private readonly listWarrantiesUseCase: ListWarrantiesUseCase,
    private readonly lookupWarrantyByCodeUseCase: LookupWarrantyByCodeUseCase,
    private readonly lookupWarrantyForCustomerUseCase: LookupWarrantyForCustomerUseCase,
    private readonly listMyProductsUseCase: ListMyProductsUseCase,
    private readonly getMyProductWarrantyUseCase: GetMyProductWarrantyUseCase,
    private readonly manualWarrantyActivationUseCase: ManualWarrantyActivationUseCase,
    private readonly downloadWarrantyImportTemplateUseCase: DownloadWarrantyImportTemplateUseCase,
    private readonly exportWarrantiesUseCase: ExportWarrantiesUseCase,
    private readonly previewWarrantyImportUseCase: PreviewWarrantyImportUseCase,
    private readonly updateWarrantyUseCase: UpdateWarrantyUseCase,
    private readonly voidWarrantyUseCase: VoidWarrantyUseCase,
  ) {}

  @Get('warranties')
  @Permissions([permission_key.WARRANTY_VIEW])
  listWarranties(@Query() dto: ListWarrantiesDto) {
    return this.listWarrantiesUseCase.execute(dto);
  }

  @Get('warranties/export')
  @Permissions([permission_key.WARRANTY_VIEW])
  async exportWarranties(
    @Query() dto: ListWarrantiesDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportWarrantiesUseCase.execute(dto);
    sendExcelFile(res, buffer, createDatedExcelFilename('warranties'));
  }

  @Get('warranties/import-template')
  @Permissions([permission_key.WARRANTY_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer = await this.downloadWarrantyImportTemplateUseCase.execute();
    sendExcelFile(res, buffer, 'warranty-import-template.xlsx');
  }

  @Post('warranties/import/preview')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  @UseInterceptors(FileInterceptor('file'))
  previewImport(@UploadedFile() file: Express.Multer.File) {
    return this.previewWarrantyImportUseCase.execute(file);
  }

  @Get('warranties/lookup')
  @Permissions([permission_key.WARRANTY_VIEW])
  lookupWarrantyByCode(@Query() dto: LookupWarrantyDto) {
    return this.lookupWarrantyByCodeUseCase.execute(dto);
  }

  @Get('warranties/:id')
  @Permissions([permission_key.WARRANTY_VIEW])
  getWarrantyDetail(@Param('id') id: string) {
    return this.getWarrantyDetailUseCase.execute(id);
  }

  @Patch('warranties/:id')
  @Permissions([permission_key.WARRANTY_UPDATE])
  updateWarranty(
    @Param('id') id: string,
    @Body() dto: UpdateWarrantyDto,
    @User() user: RequestUser,
  ) {
    return this.updateWarrantyUseCase.execute(id, dto, {
      adjustedByUserId: user.id,
    });
  }

  @Post('warranties/activate-by-code')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  activateWarrantyByCode(
    @Body() dto: ActivateWarrantyByCodeDto,
    @User() user: RequestUser,
  ) {
    return this.activateWarrantyByCodeUseCase.execute(dto, {
      activatedByUserId: user.id,
    });
  }

  @Post('warranties/:id/activate')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  activateWarrantyById(
    @Param('id') warrantyId: string,
    @Body() dto: ActivateWarrantyDto,
    @User() user: RequestUser,
  ) {
    return this.activateWarrantyUseCase.execute(warrantyId, dto, {
      activatedByUserId: user.id,
    });
  }

  @Post('warranties/:id/void')
  @Permissions([permission_key.WARRANTY_VOID])
  voidWarranty(
    @Param('id') warrantyId: string,
    @Body() dto: VoidWarrantyDto,
    @User() user: RequestUser,
  ) {
    return this.voidWarrantyUseCase.execute(warrantyId, dto, {
      voidedByUserId: user.id,
    });
  }

  @Post('warranties/manual-activation')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  manualActivation(
    @Body() dto: ManualWarrantyActivationDto,
    @User() user: RequestUser,
  ) {
    return this.manualWarrantyActivationUseCase.execute(dto, {
      activatedByUserId: user.id,
    });
  }

  @Post('products/:id/activate-warranty')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  activateWarranty(
    @Param('id') productId: string,
    @Body() dto: ActivateWarrantyDto,
    @User() user: RequestUser,
  ) {
    return this.activateProductWarrantyUseCase.execute(productId, dto, {
      activatedByUserId: user.id,
    });
  }

  @Get('products/:id/warranty')
  @Permissions([permission_key.WARRANTY_VIEW])
  getWarrantyByProduct(@Param('id') productId: string) {
    return this.getWarrantyByProductUseCase.execute(productId);
  }

  @Get('me/products')
  @Permissions([permission_key.PRODUCT_VIEW])
  listMyProducts(@User() user: RequestUser) {
    return this.listMyProductsUseCase.execute(user.id);
  }

  @Post('me/warranty-lookup')
  @Permissions([permission_key.WARRANTY_LOOKUP_OWN])
  lookupWarranty(@User() user: RequestUser, @Body() dto: LookupWarrantyDto) {
    return this.lookupWarrantyForCustomerUseCase.execute(user.id, dto);
  }

  @Get('me/products/:id/warranty')
  @Permissions([permission_key.WARRANTY_VIEW])
  getMyProductWarranty(
    @User() user: RequestUser,
    @Param('id') productId: string,
  ) {
    return this.getMyProductWarrantyUseCase.execute(user.id, productId);
  }
}
