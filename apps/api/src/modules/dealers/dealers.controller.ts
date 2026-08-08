import { Public } from '@/common/decorators/public.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { ListDealerActivatedCustomersDto } from '@/modules/dealers/dto/list-dealer-activated-customers.dto';
import { UpdateDealerDto } from '@/modules/dealers/dto/update-dealer.dto';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { DownloadDealerImportTemplateUseCase } from '@/modules/dealers/use-cases/download-dealer-import-template.use-case';
import { ExportDealersUseCase } from '@/modules/dealers/use-cases/export-dealers.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { ImportDealersUseCase } from '@/modules/dealers/use-cases/import-dealers.use-case';
import { ListDealerProvincesUseCase } from '@/modules/dealers/use-cases/list-dealer-provinces.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { ListDealerActivatedCustomersUseCase } from '@/modules/dealers/use-cases/list-dealer-activated-customers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
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

@Controller('dealers')
export class DealersController {
  constructor(
    private readonly createDealerUseCase: CreateDealerUseCase,
    private readonly listDealersUseCase: ListDealersUseCase,
    private readonly listDealerActivatedCustomersUseCase: ListDealerActivatedCustomersUseCase,
    private readonly getDealerDetailUseCase: GetDealerDetailUseCase,
    private readonly updateDealerUseCase: UpdateDealerUseCase,
    private readonly listDealerProvincesUseCase: ListDealerProvincesUseCase,
    private readonly downloadDealerImportTemplateUseCase: DownloadDealerImportTemplateUseCase,
    private readonly exportDealersUseCase: ExportDealersUseCase,
    private readonly importDealersUseCase: ImportDealersUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.DEALER_CREATE])
  create(@Body() dto: CreateDealerDto) {
    return this.createDealerUseCase.execute(dto);
  }

  @Get()
  @Public()
  list(@Query() query: ListDealersDto) {
    return this.listDealersUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.DEALER_VIEW])
  async exportDealers(
    @Query() query: ListDealersDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportDealersUseCase.execute(query);
    sendExcelFile(res, buffer, createDatedExcelFilename('dealers'));
  }

  @Get(':id/activated-customers')
  @Permissions([permission_key.DEALER_VIEW])
  listActivatedCustomers(
    @Param('id') id: string,
    @Query() query: ListDealerActivatedCustomersDto,
  ) {
    return this.listDealerActivatedCustomersUseCase.execute(id, query);
  }

  @Get('import-template')
  @Permissions([permission_key.DEALER_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer = await this.downloadDealerImportTemplateUseCase.execute();
    sendExcelFile(res, buffer, 'dealer-import-template.xlsx');
  }

  @Post('import')
  @Permissions([permission_key.DEALER_CREATE])
  @UseInterceptors(FileInterceptor('file'))
  importDealers(@UploadedFile() file: Express.Multer.File) {
    return this.importDealersUseCase.execute(file);
  }

  @Get('provinces')
  @Permissions([permission_key.DEALER_VIEW])
  listProvinces() {
    return this.listDealerProvincesUseCase.execute();
  }

  @Get(':id')
  @Permissions([permission_key.DEALER_VIEW])
  detail(@Param('id') id: string) {
    return this.getDealerDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.DEALER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateDealerDto) {
    return this.updateDealerUseCase.execute(id, dto);
  }

  @Patch(':id/deactivate')
  @Permissions([permission_key.DEALER_DELETE])
  deactivate(@Param('id') id: string) {
    return this.updateDealerUseCase.execute(id, { isActive: false });
  }
}
