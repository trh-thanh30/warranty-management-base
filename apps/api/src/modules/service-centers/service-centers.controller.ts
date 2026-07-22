import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { UpdateServiceCenterDto } from '@/modules/service-centers/dto/update-service-center.dto';
import { CreateServiceCenterUseCase } from '@/modules/service-centers/use-cases/create-service-center.use-case';
import { DownloadServiceCenterImportTemplateUseCase } from '@/modules/service-centers/use-cases/download-service-center-import-template.use-case';
import { ExportServiceCentersUseCase } from '@/modules/service-centers/use-cases/export-service-centers.use-case';
import { GetServiceCenterDetailUseCase } from '@/modules/service-centers/use-cases/get-service-center-detail.use-case';
import { ImportServiceCentersUseCase } from '@/modules/service-centers/use-cases/import-service-centers.use-case';
import { ListServiceCenterProvincesUseCase } from '@/modules/service-centers/use-cases/list-service-center-provinces.use-case';
import { ListServiceCentersUseCase } from '@/modules/service-centers/use-cases/list-service-centers.use-case';
import { UpdateServiceCenterUseCase } from '@/modules/service-centers/use-cases/update-service-center.use-case';
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

@Controller('service-centers')
export class ServiceCentersController {
  constructor(
    private readonly createServiceCenterUseCase: CreateServiceCenterUseCase,
    private readonly listServiceCentersUseCase: ListServiceCentersUseCase,
    private readonly listServiceCenterProvincesUseCase: ListServiceCenterProvincesUseCase,
    private readonly getServiceCenterDetailUseCase: GetServiceCenterDetailUseCase,
    private readonly updateServiceCenterUseCase: UpdateServiceCenterUseCase,
    private readonly downloadServiceCenterImportTemplateUseCase: DownloadServiceCenterImportTemplateUseCase,
    private readonly exportServiceCentersUseCase: ExportServiceCentersUseCase,
    private readonly importServiceCentersUseCase: ImportServiceCentersUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.SERVICE_CENTER_CREATE])
  create(@Body() dto: CreateServiceCenterDto) {
    return this.createServiceCenterUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  list(@Query() query: ListServiceCentersDto) {
    return this.listServiceCentersUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  async exportServiceCenters(
    @Query() query: ListServiceCentersDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportServiceCentersUseCase.execute(query);
    sendExcelFile(res, buffer, createDatedExcelFilename('service-centers'));
  }

  @Get('import-template')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer =
      await this.downloadServiceCenterImportTemplateUseCase.execute();
    sendExcelFile(res, buffer, 'service-center-import-template.xlsx');
  }

  @Post('import')
  @Permissions([permission_key.SERVICE_CENTER_CREATE])
  @UseInterceptors(FileInterceptor('file'))
  importServiceCenters(@UploadedFile() file: Express.Multer.File) {
    return this.importServiceCentersUseCase.execute(file);
  }

  @Get('provinces')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  listProvinces() {
    return this.listServiceCenterProvincesUseCase.execute();
  }

  @Get(':id')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  detail(@Param('id') id: string) {
    return this.getServiceCenterDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.SERVICE_CENTER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateServiceCenterDto) {
    return this.updateServiceCenterUseCase.execute(id, dto);
  }

  @Patch(':id/deactivate')
  @Permissions([permission_key.SERVICE_CENTER_DELETE])
  deactivate(@Param('id') id: string) {
    return this.updateServiceCenterUseCase.execute(id, { isActive: false });
  }
}
