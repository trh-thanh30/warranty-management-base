import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BadRequestError } from '@/common/response';
import { CreateActivationCodeBatchDto } from '@/modules/activation-codes/dto/create-activation-code-batch.dto';
import { PrintableActivationLabelsQueryDto } from '@/modules/activation-codes/dto/printable-activation-labels-query.dto';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { CreatePrintableActivationLabelsUseCase } from '@/modules/activation-codes/use-cases/create-printable-activation-labels.use-case';
import { RevokeActivationCodeUseCase } from '@/modules/activation-codes/use-cases/revoke-activation-code.use-case';
import type { Response } from 'express';
import { permission_key } from '@prisma/client';

type RequestUser = { id?: string };

@Controller('activation-code-batches')
export class ActivationCodesController {
  constructor(
    private readonly createActivationCodeBatchUseCase: CreateActivationCodeBatchUseCase,
    private readonly createPrintableLabelsUseCase: CreatePrintableActivationLabelsUseCase,
    private readonly revokeActivationCodeUseCase: RevokeActivationCodeUseCase,
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

  @Get(':id/printable')
  @Permissions([permission_key.ACTIVATION_CODE_BATCH_PRINT])
  async printable(
    @Param('id') id: string,
    @Query() query: PrintableActivationLabelsQueryDto,
    @Res() response: Response,
  ) {
    const result = await this.createPrintableLabelsUseCase.execute(id, {
      from: query.from,
      to: query.to,
    });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    response.send(result.pdf);
  }
}
