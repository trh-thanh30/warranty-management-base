import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BadRequestError } from '@/common/response';
import { CreateActivationCodeBatchDto } from '@/modules/activation-codes/dto/create-activation-code-batch.dto';
import { PrintableActivationLabelsQueryDto } from '@/modules/activation-codes/dto/printable-activation-labels-query.dto';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { RevokeActivationCodeUseCase } from '@/modules/activation-codes/use-cases/revoke-activation-code.use-case';
import type { Response } from 'express';
import { permission_key } from '@prisma/client';
import { RequestActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/request-activation-label-print-job.use-case';
import { GetActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/get-activation-label-print-job.use-case';
import { DownloadActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/download-activation-label-print-job.use-case';

type RequestUser = { id?: string };

@Controller('activation-code-batches')
export class ActivationCodesController {
  constructor(
    private readonly createActivationCodeBatchUseCase: CreateActivationCodeBatchUseCase,
    private readonly revokeActivationCodeUseCase: RevokeActivationCodeUseCase,
    private readonly requestPrintJobUseCase: RequestActivationLabelPrintJobUseCase,
    private readonly getPrintJobUseCase: GetActivationLabelPrintJobUseCase,
    private readonly downloadPrintJobUseCase: DownloadActivationLabelPrintJobUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_CREATE])
  create(@Body() dto: CreateActivationCodeBatchDto, @User() user: RequestUser) {
    if (!user?.id) {
      throw new BadRequestError(
        'Authenticated user is required',
        'ACTIVATION_CODE_CREATOR_REQUIRED',
      );
    }
    return this.createActivationCodeBatchUseCase.execute({
      ...dto,
      createdById: user.id,
    });
  }

  @Post('codes/:id/revoke')
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_REVOKE])
  revoke(@Param('id') id: string) {
    return this.revokeActivationCodeUseCase.execute(id);
  }

  @Post(':id/print-jobs')
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_PRINT])
  requestPrintJob(
    @Param('id') id: string,
    @Query() query: PrintableActivationLabelsQueryDto,
    @User() user: RequestUser,
  ) {
    if (!user?.id) throw new BadRequestError('Authenticated user is required');
    return this.requestPrintJobUseCase.execute({
      batchId: id,
      from: query.from,
      requestedById: user.id,
      to: query.to,
    });
  }

  @Get('print-jobs/:id')
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_PRINT])
  getPrintJob(@Param('id') id: string) {
    return this.getPrintJobUseCase.execute(id);
  }

  @Get('print-jobs/:id/download')
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_PRINT])
  async downloadPrintJob(@Param('id') id: string, @Res() response: Response) {
    const result = await this.downloadPrintJobUseCase.execute(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    result.stream.pipe(response);
  }
}
