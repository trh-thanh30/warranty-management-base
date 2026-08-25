import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { ExportWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/export-warranty-activation-requests.use-case';
import { GetWarrantyActivationRequestDetailUseCase } from '@/modules/warranty-activation-requests/use-cases/get-warranty-activation-request-detail.use-case';
import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-activation-requests/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import { RetryWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/retry-warranty-activation-request-certificate.use-case';
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
import {
  permission_key,
  warranty_activation_request_source,
} from '@prisma/client';
import type { Response } from 'express';

type RequestUser = {
  id?: string;
};

@Controller('warranty-activation-requests')
export class WarrantyActivationRequestsController {
  constructor(
    private readonly createAdminWarrantyActivationRequestUseCase: CreateAdminWarrantyActivationRequestUseCase,
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly downloadWarrantyActivationRequestCertificateUseCase: DownloadWarrantyActivationRequestCertificateUseCase,
    private readonly exportWarrantyActivationRequestsUseCase: ExportWarrantyActivationRequestsUseCase,
    private readonly listWarrantyActivationRequestsUseCase: ListWarrantyActivationRequestsUseCase,
    private readonly getWarrantyActivationRequestDetailUseCase: GetWarrantyActivationRequestDetailUseCase,
    private readonly reviewWarrantyActivationRequestUseCase: ReviewWarrantyActivationRequestUseCase,
    private readonly resendWarrantyActivationRequestCertificateEmailUseCase: ResendWarrantyActivationRequestCertificateEmailUseCase,
    private readonly retryWarrantyActivationRequestCertificateUseCase: RetryWarrantyActivationRequestCertificateUseCase,
  ) {}

  @Post('admin')
  @Permissions([permission_key.WARRANTY_CREATE])
  createAdmin(
    @Body() dto: CreateAdminWarrantyActivationRequestDto,
    @User() user: RequestUser,
  ) {
    return this.createAdminWarrantyActivationRequestUseCase.execute(dto, {
      createdByUserId: user?.id,
    });
  }

  @Post()
  @Permissions([permission_key.WARRANTY_CREATE])
  create(
    @Body() dto: CreateWarrantyActivationRequestDto,
    @User() user: RequestUser,
  ) {
    return this.createWarrantyActivationRequestUseCase.execute(dto, {
      createdByUserId: user?.id,
      source: warranty_activation_request_source.ADMIN_PORTAL,
    });
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

  @Get(':id/certificate/view')
  @Permissions([permission_key.WARRANTY_VIEW])
  async viewCertificate(@Param('id') id: string, @Res() response: Response) {
    await this.sendCertificateFile(id, response, 'inline');
  }

  @Get(':id/certificate/download')
  @Permissions([permission_key.WARRANTY_VIEW])
  async downloadCertificate(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.sendCertificateFile(id, response, 'attachment');
  }

  @Get(':id/items/:itemId/certificate/view')
  @Permissions([permission_key.WARRANTY_VIEW])
  async viewItemCertificate(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Res() response: Response,
  ) {
    await this.sendCertificateFile(id, response, 'inline', itemId);
  }

  @Get(':id/items/:itemId/certificate/download')
  @Permissions([permission_key.WARRANTY_VIEW])
  async downloadItemCertificate(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Res() response: Response,
  ) {
    await this.sendCertificateFile(id, response, 'attachment', itemId);
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

  @Post(':id/certificate/resend-email')
  @Permissions([permission_key.WARRANTY_UPDATE])
  resendCertificateEmail(@Param('id') id: string) {
    return this.resendWarrantyActivationRequestCertificateEmailUseCase.execute(
      id,
    );
  }

  @Post(':id/items/:itemId/certificate/resend-email')
  @Permissions([permission_key.WARRANTY_UPDATE])
  resendItemCertificateEmail(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.resendWarrantyActivationRequestCertificateEmailUseCase.execute(
      id,
      itemId,
    );
  }

  @Post(':id/certificate/retry')
  @Permissions([permission_key.WARRANTY_UPDATE])
  retryCertificate(@Param('id') id: string) {
    return this.retryWarrantyActivationRequestCertificateUseCase.execute(id);
  }

  @Post(':id/items/:itemId/certificate/retry')
  @Permissions([permission_key.WARRANTY_UPDATE])
  retryItemCertificate(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.retryWarrantyActivationRequestCertificateUseCase.execute(
      id,
      itemId,
    );
  }

  private async sendCertificateFile(
    id: string,
    response: Response,
    disposition: 'attachment' | 'inline',
    itemId?: string,
  ) {
    const { filename, stream } =
      await this.downloadWarrantyActivationRequestCertificateUseCase.execute(
        id,
        itemId,
      );

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${filename}"`,
    );
    stream.pipe(response);
  }
}
