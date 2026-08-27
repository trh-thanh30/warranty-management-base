import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { UpdateCustomerDto } from '@/modules/customers/dto/update-customer.dto';
import { CreateCustomerUseCase } from '@/modules/customers/use-cases/create-customer.use-case';
import { DownloadCustomerImportTemplateUseCase } from '@/modules/customers/use-cases/download-customer-import-template.use-case';
import { ExportCustomersUseCase } from '@/modules/customers/use-cases/export-customers.use-case';
import { GetCustomerDetailUseCase } from '@/modules/customers/use-cases/get-customer-detail.use-case';
import { ImportCustomersUseCase } from '@/modules/customers/use-cases/import-customers.use-case';
import { ListCustomersUseCase } from '@/modules/customers/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '@/modules/customers/use-cases/update-customer.use-case';
import { SoftDeleteCustomerUseCase } from '@/modules/customers/use-cases/soft-delete-customer.use-case';
import { RestoreCustomerUseCase } from '@/modules/customers/use-cases/restore-customer.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { permission_key } from '@prisma/client';
import express from 'express';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerDetailUseCase: GetCustomerDetailUseCase,
    private readonly downloadCustomerImportTemplateUseCase: DownloadCustomerImportTemplateUseCase,
    private readonly exportCustomersUseCase: ExportCustomersUseCase,
    private readonly importCustomersUseCase: ImportCustomersUseCase,
    private readonly softDeleteCustomerUseCase: SoftDeleteCustomerUseCase,
    private readonly restoreCustomerUseCase: RestoreCustomerUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.CUSTOMER_VIEW])
  list(@Query() query: ListCustomersDto) {
    return this.listCustomersUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.CUSTOMER_VIEW])
  async exportCustomers(
    @Query() query: ListCustomersDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportCustomersUseCase.execute(query);
    sendExcelFile(res, buffer, createDatedExcelFilename('customers'));
  }

  @Get('import-template')
  @Permissions([permission_key.CUSTOMER_VIEW])
  async downloadImportTemplate(@Res() res: express.Response) {
    const buffer = await this.downloadCustomerImportTemplateUseCase.execute();
    sendExcelFile(res, buffer, 'customer-import-template.xlsx');
  }

  @Post('import')
  @Permissions([permission_key.CUSTOMER_CREATE])
  @UseInterceptors(FileInterceptor('file'))
  importCustomers(@UploadedFile() file: Express.Multer.File) {
    return this.importCustomersUseCase.execute(file);
  }

  @Post()
  @Permissions([permission_key.CUSTOMER_CREATE])
  create(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.CUSTOMER_VIEW])
  detail(@Param('id') id: string) {
    return this.getCustomerDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.CUSTOMER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateCustomerUseCase.execute(id, dto);
  }

  @Patch(':id/restore')
  @Permissions([permission_key.CUSTOMER_DELETE])
  restore(@Param('id') id: string) {
    return this.restoreCustomerUseCase.execute(id);
  }

  @Delete(':id')
  @Permissions([permission_key.CUSTOMER_DELETE])
  softDelete(@Param('id') id: string) {
    return this.softDeleteCustomerUseCase.execute(id);
  }
}
