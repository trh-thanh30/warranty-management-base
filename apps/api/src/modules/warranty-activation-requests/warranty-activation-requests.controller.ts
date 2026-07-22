import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { ExportWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/export-warranty-activation-requests.use-case';
import { GetWarrantyActivationRequestDetailUseCase } from '@/modules/warranty-activation-requests/use-cases/get-warranty-activation-request-detail.use-case';
import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';
import type { Response } from 'express';

type RequestUser = {
  id?: string;
};

@Controller('warranty-activation-requests')
export class WarrantyActivationRequestsController {
  constructor(
    private readonly createAdminWarrantyActivationRequestUseCase: CreateAdminWarrantyActivationRequestUseCase,
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly exportWarrantyActivationRequestsUseCase: ExportWarrantyActivationRequestsUseCase,
    private readonly listWarrantyActivationRequestsUseCase: ListWarrantyActivationRequestsUseCase,
    private readonly getWarrantyActivationRequestDetailUseCase: GetWarrantyActivationRequestDetailUseCase,
    private readonly reviewWarrantyActivationRequestUseCase: ReviewWarrantyActivationRequestUseCase,
  ) {}

  @Post('admin')
  @Permissions([permission_key.WARRANTY_CREATE])
  createAdmin(@Body() dto: CreateAdminWarrantyActivationRequestDto) {
    return this.createAdminWarrantyActivationRequestUseCase.execute(dto);
  }

  @Post()
  @Public()
  create(@Body() dto: CreateWarrantyActivationRequestDto) {
    return this.createWarrantyActivationRequestUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.WARRANTY_VIEW])
  list(@Query() query: ListWarrantyActivationRequestsDto) {
    return this.listWarrantyActivationRequestsUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.WARRANTY_VIEW])
  async export(
    @Query() query: ListWarrantyActivationRequestsDto,
    @Res() response: Response,
  ) {
    const buffer =
      await this.exportWarrantyActivationRequestsUseCase.execute(query);
    sendExcelFile(
      response,
      buffer,
      createDatedExcelFilename('warranty-activation-requests'),
    );
  }

  @Get(':id')
  @Permissions([permission_key.WARRANTY_VIEW])
  detail(@Param('id') id: string) {
    return this.getWarrantyActivationRequestDetailUseCase.execute(id);
  }

  @Patch(':id/review')
  @Permissions([permission_key.WARRANTY_UPDATE])
  review(
    @Param('id') id: string,
    @Body() dto: ReviewWarrantyActivationRequestDto,
    @User() user: RequestUser,
  ) {
    return this.reviewWarrantyActivationRequestUseCase.execute(id, dto, {
      reviewedByUserId: user?.id,
    });
  }
}
