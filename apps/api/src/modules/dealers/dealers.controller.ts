import { Public } from '@/common/decorators/public.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
import { AddDealerMemberDto } from '@/modules/dealers/dto/add-dealer-member.dto';
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
import { AddDealerMemberUseCase } from '@/modules/dealers/use-cases/add-dealer-member.use-case';
import { ListDealerMembersUseCase } from '@/modules/dealers/use-cases/list-dealer-members.use-case';
import { ListAssignedDealersUseCase } from '@/modules/dealers/use-cases/list-assigned-dealers.use-case';
import { ListManagedDealersUseCase } from '@/modules/dealers/use-cases/list-managed-dealers.use-case';
import { RemoveDealerMemberUseCase } from '@/modules/dealers/use-cases/remove-dealer-member.use-case';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
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
    private readonly addDealerMemberUseCase: AddDealerMemberUseCase,
    private readonly listDealerMembersUseCase: ListDealerMembersUseCase,
    private readonly listAssignedDealersUseCase: ListAssignedDealersUseCase,
    private readonly listManagedDealersUseCase: ListManagedDealersUseCase,
    private readonly removeDealerMemberUseCase: RemoveDealerMemberUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.DEALER_CREATE])
  create(
    @Body() dto: CreateDealerDto,
    @User() user: { id?: string; role?: string },
  ) {
    return this.createDealerUseCase.execute(dto, {
      userId: user.id,
      userRole: user.role,
    });
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
    @User() user: { id: string; role: string },
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportDealersUseCase.execute(query, user);
    sendExcelFile(res, buffer, createDatedExcelFilename('dealers'));
  }

  @Get('assigned-to-me')
  @Roles(['MODERATOR'])
  @Permissions([permission_key.DEALER_VIEW])
  listAssignedToMe(@User() user: { id: string }) {
    return this.listAssignedDealersUseCase.execute(user.id);
  }

  @Get('managed')
  @Roles(['ADMIN', 'MODERATOR'])
  @Permissions([permission_key.DEALER_VIEW])
  listManaged(
    @Query() query: ListDealersDto,
    @User() user: { id: string; role: string },
  ) {
    return this.listManagedDealersUseCase.execute(query, user);
  }

  @Get(':id/activated-customers')
  @Permissions([permission_key.DEALER_VIEW])
  listActivatedCustomers(
    @Param('id') id: string,
    @Query() query: ListDealerActivatedCustomersDto,
    @User() user: { id: string; role: string },
  ) {
    return this.listDealerActivatedCustomersUseCase.execute(id, query, user);
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
  importDealers(
    @UploadedFile() file: Express.Multer.File,
    @User() user: { id?: string; role?: string },
  ) {
    return this.importDealersUseCase.execute(file, {
      userId: user.id,
      userRole: user.role,
    });
  }

  @Get('provinces')
  @Permissions([permission_key.DEALER_VIEW])
  listProvinces(@User() user: { id: string; role: string }) {
    return this.listDealerProvincesUseCase.execute(user);
  }

  @Get(':id/members')
  @Roles(['ADMIN'])
  @Permissions([permission_key.DEALER_VIEW])
  listMembers(@Param('id') id: string) {
    return this.listDealerMembersUseCase.execute(id);
  }

  @Post(':id/members')
  @Roles(['ADMIN'])
  @Permissions([permission_key.DEALER_UPDATE])
  addMember(
    @Param('id') id: string,
    @Body() dto: AddDealerMemberDto,
    @User() user: { id?: string },
  ) {
    return this.addDealerMemberUseCase.execute(id, dto, {
      createdByUserId: user.id,
    });
  }

  @Delete(':id/members/:membershipId')
  @Roles(['ADMIN'])
  @Permissions([permission_key.DEALER_UPDATE])
  removeMember(
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.removeDealerMemberUseCase.execute(id, membershipId);
  }

  @Get(':id')
  @Permissions([permission_key.DEALER_VIEW])
  detail(@Param('id') id: string, @User() user: { id: string; role: string }) {
    return this.getDealerDetailUseCase.execute(id, user);
  }

  @Patch(':id')
  @Permissions([permission_key.DEALER_UPDATE])
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDealerDto,
    @User() user: { id: string; role: string },
  ) {
    return this.updateDealerUseCase.execute(id, dto, user);
  }

  @Patch(':id/deactivate')
  @Permissions([permission_key.DEALER_DELETE])
  deactivate(
    @Param('id') id: string,
    @User() user: { id: string; role: string },
  ) {
    return this.updateDealerUseCase.execute(id, { isActive: false }, user);
  }
}
